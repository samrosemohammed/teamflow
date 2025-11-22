import z from "zod";
import { standardSecurityMiddleware } from "../middlewares/arcject/standard";
import { writeSecurityMiddleware } from "../middlewares/arcject/write";
import { requireAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requireWorkspacehMiddleware } from "../middlewares/workspace";
import prisma from "@/lib/db";
import { createMessageSchema } from "@/schemas/message";
import { getAvatar } from "@/lib/get-avatar";
import { Message } from "../generated/prisma/client";
import { readSecurityMiddleware } from "../middlewares/arcject/read";

export const createMessage = base
  .use(requireAuthMiddleware)
  .use(requireWorkspacehMiddleware)
  .use(standardSecurityMiddleware)
  .use(writeSecurityMiddleware)
  .route({
    method: "POST",
    path: "/messages",
    summary: "Create a message",
    tags: ["Messages"],
  })
  .input(createMessageSchema)
  .output(z.custom<Message>())
  .handler(async ({ input, context, errors }) => {
    console.log("Creating message with input:", input);
    // Verify the channel belongs to the users
    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });
    if (!channel) {
      throw errors.FORBIDDEN();
    }
    const created = await prisma.message.create({
      data: {
        content: input.content,
        imageUrl: input.imageUrl,
        channelId: input.channelId,
        authorId: context.user.id,
        authorAvatar: getAvatar(context.user.picture, context.user.email!),
        authorName: context.user.given_name ?? "John Doe",
        authorEmail: context.user.email!,
      },
    });
    return {
      ...created,
    };
  });

export const listMessages = base
  .use(requireAuthMiddleware)
  .use(requireWorkspacehMiddleware)
  .use(standardSecurityMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: "GET",
    path: "/messages",
    summary: "List all messages",
    tags: ["Messages"],
  })
  .input(
    z.object({
      channelId: z.string(),
    })
  )
  .output(z.array(z.custom<Message>()))
  .handler(async ({ input, context, errors }) => {
    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });
    if (!channel) {
      throw errors.FORBIDDEN();
    }
    const data = await prisma.message.findMany({
      where: {
        channelId: input.channelId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return data;
  });

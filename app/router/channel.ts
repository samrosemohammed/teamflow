import { channelNameSchema } from "@/schemas/channel";
import { heavyWriteSecurityMiddleware } from "../middlewares/arcject/heavy-write";
import { standardSecurityMiddleware } from "../middlewares/arcject/standard";
import { requireAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requireWorkspacehMiddleware } from "../middlewares/workspace";
import z from "zod";
import prisma from "@/lib/db";
import { Channel } from "../generated/prisma/client";
import {
  init,
  organization_user,
  Organizations,
} from "@kinde/management-api-js";
import { KindeOrganization, KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { readSecurityMiddleware } from "../middlewares/arcject/read";

export const createChannel = base
  .use(requireAuthMiddleware)
  .use(requireWorkspacehMiddleware)
  .use(standardSecurityMiddleware)
  .use(heavyWriteSecurityMiddleware)
  .route({
    method: "POST",
    path: "/channels",
    summary: "Create a new channel",
    tags: ["channel"],
  })
  .input(channelNameSchema)
  .output(z.custom<Channel>())
  .handler(async ({ input, context }) => {
    const channel = await prisma.channel.create({
      data: {
        name: input.name,
        workspaceId: context.workspace.orgCode,
        createById: context.user.id,
      },
    });
    return channel;
  });

export const listChannels = base
  .use(requireAuthMiddleware)
  .use(requireWorkspacehMiddleware)
  .route({
    method: "GET",
    path: "/channels",
    summary: "List all channels in a workspace",
    tags: ["channel"],
  })
  .input(z.void())
  .output(
    z.object({
      channels: z.array(z.custom<Channel>()),
      members: z.array(z.custom<organization_user>()),
      currentWorkspace: z.custom<KindeOrganization<unknown>>(),
    })
  )
  .handler(async ({ context }) => {
    // for parallel fetching
    const [channels, members] = await Promise.all([
      prisma.channel.findMany({
        where: {
          workspaceId: context.workspace.orgCode,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      (async () => {
        init();
        const usersInOrg = await Organizations.getOrganizationUsers({
          orgCode: context.workspace.orgCode,
          sort: "name_asc",
        });
        return usersInOrg.organization_users ?? [];
      })(),
    ]);
    return {
      channels,
      members,
      currentWorkspace: context.workspace,
    };
  });

export const getChannel = base
  .use(requireAuthMiddleware)
  .use(requireWorkspacehMiddleware)
  .use(standardSecurityMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: "GET",
    path: "/channels/:channelId",
    summary: "Get a channel by ID",
    tags: ["channel"],
  })
  .input(z.object({ channelId: z.string() }))
  .output(
    z.object({
      currentUser: z.custom<KindeUser<Record<string, unknown>>>(),
      channelName: z.string(),
    })
  )
  .handler(async ({ input, context, errors }) => {
    const channel = await prisma.channel.findUnique({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
      select: {
        name: true,
      },
    });
    if (!channel) {
      throw errors.NOT_FOUND();
    }
    return {
      channelName: channel.name,
      currentUser: context.user,
    };
  });

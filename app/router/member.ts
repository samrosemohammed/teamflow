import { inviteMemberSchema } from "@/schemas/member";
import { heavyWriteSecurityMiddleware } from "../middlewares/arcject/heavy-write";
import { standardSecurityMiddleware } from "../middlewares/arcject/standard";
import { requireAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requireWorkspacehMiddleware } from "../middlewares/workspace";
import z from "zod";
import {
  init,
  organization_user,
  Organizations,
  Users,
} from "@kinde/management-api-js";
import { getAvatar } from "@/lib/get-avatar";
import { readSecurityMiddleware } from "../middlewares/arcject/read";

export const inviteMember = base
  .use(requireAuthMiddleware)
  .use(requireWorkspacehMiddleware)
  .use(standardSecurityMiddleware)
  .use(heavyWriteSecurityMiddleware)
  .route({
    method: "POST",
    summary: "Invite a new member to the workspace",
    tags: ["Invite Member"],
    path: "/workspace/members/invite",
  })
  .input(inviteMemberSchema)
  .output(z.void())
  .handler(async ({ input, context, errors }) => {
    try {
      init();
      await Users.createUser({
        requestBody: {
          organization_code: context.workspace.orgCode,
          profile: {
            given_name: input.name,
            picture: getAvatar(null, input.email),
          },
          identities: [
            {
              type: "email",
              details: {
                email: input.email,
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error inviting member:", error);
      throw errors.INTERNAL_SERVER_ERROR();
    }
  });

export const listMembers = base
  .use(requireAuthMiddleware)
  .use(requireWorkspacehMiddleware)
  .use(standardSecurityMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: "GET",
    summary: "List all members in the workspace",
    tags: ["Members"],
    path: "/workspace/members",
  })
  .input(z.void())
  .output(z.array(z.custom<organization_user>()))
  .handler(async ({ context, errors }) => {
    try {
      init();
      const data = await Organizations.getOrganizationUsers({
        orgCode: context.workspace.orgCode,
        sort: "name_asc",
      });
      if (!data.organization_users) {
        throw errors.NOT_FOUND();
      }
      return data.organization_users;
    } catch {
      throw errors.INTERNAL_SERVER_ERROR();
    }
  });

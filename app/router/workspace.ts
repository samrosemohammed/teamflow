import { KindeOrganization, KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import z from "zod";
import { base } from "../middlewares/base";
import { requireAuthMiddleware } from "../middlewares/auth";
import { requireWorkspacehMiddleware } from "../middlewares/workspace";
import { WorkspaceSchema } from "@/schemas/workspace";
import { init, Organizations } from "@kinde/management-api-js";
import { standardSecurityMiddleware } from "../middlewares/arcject/standard";
import { heavyWriteSecurityMiddleware } from "../middlewares/arcject/heavy-write";

export const listWorkspaces = base
  .use(requireAuthMiddleware)
  .use(requireWorkspacehMiddleware)
  .route({
    method: "GET",
    path: "/workspace",
    summary: "List all workspaces",
    tags: ["workspace"],
  })
  .input(z.void())
  .output(
    z.object({
      workspaces: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string(),
        })
      ),
      user: z.custom<KindeUser<Record<string, unknown>>>(),
      currentWorkspace: z.custom<KindeOrganization<unknown>>(),
    })
  )
  .handler(async ({ context, errors }) => {
    const { getUserOrganizations } = getKindeServerSession();
    const organization = await getUserOrganizations();
    if (!organization) {
      throw errors.FORBIDDEN();
    }
    console.log("---", organization);
    return {
      workspaces: organization?.orgs.map((org) => ({
        id: org.code,
        name: org.name ?? "My Workspace",
        avatar: org.name?.charAt(0) ?? "M",
      })),
      user: context.user,
      currentWorkspace: context.workspace,
    };
  });

export const createWorkspace = base
  .use(requireAuthMiddleware)
  .use(requireWorkspacehMiddleware)
  .use(standardSecurityMiddleware)
  .use(heavyWriteSecurityMiddleware)
  .route({
    method: "POST",
    path: "/workspace",
    summary: "Create a new workspace",
    tags: ["workspace"],
  })
  .input(WorkspaceSchema)
  .output(
    z.object({
      orgCode: z.string(),
      workspaceName: z.string(),
    })
  )
  .handler(async ({ context, errors, input }) => {
    init();
    let data;
    try {
      data = await Organizations.createOrganization({
        requestBody: {
          name: input.name,
        },
      });
    } catch {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create organization",
      });
    }

    if (!data.organization?.code) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Organization code is missing in the response",
      });
    }

    try {
      await Organizations.addOrganizationUsers({
        orgCode: data.organization.code,
        requestBody: {
          users: [
            {
              id: context.user.id,
              roles: ["admin"],
            },
          ],
        },
      });
    } catch {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to add user to organization",
      });
    }

    const { refreshTokens } = getKindeServerSession();
    await refreshTokens();
    return {
      orgCode: data.organization.code,
      workspaceName: input.name,
    };
  });

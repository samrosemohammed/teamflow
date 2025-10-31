import { z } from "zod";
export const WorkspaceSchema = z.object({
  name: z.string().min(2).max(50),
});

export type WorkspaceFormData = z.infer<typeof WorkspaceSchema>;

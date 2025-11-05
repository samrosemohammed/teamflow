import z from "zod";

export const createMessageSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  imageUrl: z.url().optional(),
});
export type CreateMessageFormData = z.infer<typeof createMessageSchema>;

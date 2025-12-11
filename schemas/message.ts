import z from "zod";

export const createMessageSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  imageUrl: z.url().optional(),
  threadId: z.string().optional(),
});
export type CreateMessageFormData = z.infer<typeof createMessageSchema>;

export const updateMessageSchema = z.object({
  messageId: z.string(),
  content: z.string(),
});
export type UpdateMessageFormData = z.infer<typeof updateMessageSchema>;

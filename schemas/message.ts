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

export const toggleReactionsSchema = z.object({
  messageId: z.string(),
  emoji: z.string().min(1),
});

export const groupedReactionsSchema = z.object({
  emoji: z.string(),
  count: z.number(),
  reactedByMe: z.boolean(),
});

export type GroupedReactionsType = z.infer<typeof groupedReactionsSchema>;

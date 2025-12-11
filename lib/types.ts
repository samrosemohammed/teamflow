import { Message } from "@/app/generated/prisma/client";

export type MessageListItem = Message & {
  repliesCount: number;
};

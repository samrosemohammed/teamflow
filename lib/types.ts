import { Message } from "@/app/generated/prisma/client";
import { GroupedReactionsType } from "@/schemas/message";

export type MessageListItem = Message & {
  repliesCount: number;
  reactions: GroupedReactionsType[];
};

"use client";
import React from "react";
import { MessageItem } from "./message/message-item";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";

export const MessageList = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { data } = useQuery(
    orpc.message.list.queryOptions({
      input: {
        channelId: channelId,
      },
    })
  );
  console.log("Fetched messages:", data);
  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto px-4">
        {data?.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
};

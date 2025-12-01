"use client";
import React from "react";
import { ChannelHeader } from "./_components/channel-header";
import { MessageList } from "./_components/message-list";
import { MessageInput } from "./_components/message/message-input";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

const ChannelPageMain = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { data, error, isLoading } = useQuery(
    orpc.channel.get.queryOptions({
      input: {
        channelId: channelId,
      },
    })
  );
  if (error) {
    return <div>Error loading channelj</div>;
  }
  return (
    <div className="flex h-screen w-full">
      {/* Main Channel Area */}
      <div className="flex flex-col flex-1 minx-w-0">
        {/* Fixed Header */}
        <ChannelHeader />
        {/* Scrollable Message Area */}
        <div className="flex-1 overflow-hidden mb-4">
          <MessageList />
        </div>
        {/* Fixed Input */}
        <div className="border-t bg-background p-4">
          <MessageInput
            user={data?.currentUser as KindeUser<Record<string, unknown>>}
            channelId={channelId}
          />
        </div>
      </div>
    </div>
  );
};

export default ChannelPageMain;

"use client";
import React from "react";
import { ChannelHeader } from "./_components/channel-header";
import { MessageList } from "./_components/message-list";
import { MessageInput } from "./_components/message/message-input";
import { useParams } from "next/navigation";

const ChannelPageMain = () => {
  const { channelId } = useParams<{ channelId: string }>();
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
          <MessageInput channelId={channelId} />
        </div>
      </div>
    </div>
  );
};

export default ChannelPageMain;

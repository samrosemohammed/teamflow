import { SaveContent } from "@/components/raich-text-editor/save-content";
import { formatDate } from "date-fns";
import Image from "next/image";
import React from "react";
import { ReactionsBar } from "../reactions/reactions-bar";
import { MessageListItem } from "@/lib/types";

interface ThreadReplyProps {
  message: MessageListItem;
  selectedThreadId: string;
}

export const ThreadReply = ({
  message,
  selectedThreadId,
}: ThreadReplyProps) => {
  return (
    <div className="flex space-x-3 p-3 hover:bg-muted/30 rounded-lg">
      <Image
        src={message.authorAvatar}
        alt={message.authorName}
        width={32}
        height={32}
        className="size-8 rounded-full shrink-0"
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{message.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(message.createdAt, " MMM d, h:mm aa")}
          </span>
        </div>
        <SaveContent
          className="text-sm wrap-break-word prose dark:prose-invert marker:text-primary"
          content={JSON.parse(message.content)}
        />
        {message.imageUrl && (
          <div className="mt-2">
            <Image
              src={message.imageUrl}
              alt="Message Attachment"
              width={512}
              height={512}
              className="rounded-md max-h-[320px] w-auto object-contain"
            />
          </div>
        )}
        <ReactionsBar
          context={{ type: "thread", threadId: selectedThreadId }}
          reactions={message.reactions}
          messageId={message.id}
        />
      </div>
    </div>
  );
};

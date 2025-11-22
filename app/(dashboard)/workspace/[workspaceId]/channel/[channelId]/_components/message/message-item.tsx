import Image from "next/image";
import React from "react";
import { format } from "date-fns";
import { Message } from "@/app/generated/prisma/client";
import { getAvatar } from "@/lib/get-avatar";
import { SaveContent } from "@/components/raich-text-editor/save-content";
interface iAppProps {
  message: Message;
}
export const MessageItem = ({ message }: iAppProps) => {
  console.log("Rendering message:", message);
  return (
    <div className="flex space-x-3 relative p-3 rounded-lg group hover:bg-muted/50">
      <Image
        src={getAvatar(message?.authorAvatar, message?.authorEmail)}
        alt="User Avatar"
        width={32}
        height={32}
        className="size-8 rounded-lg"
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-x-2">
          <p className="font-medium leading-none">{message.authorName}</p>
          <p className="text-xs text-muted-foreground leading-none">
            {format(message.createdAt, "d MMM yyyy h:mm a")}
          </p>
        </div>
        <SaveContent
          className="break-word text-sm prose dark:prose-invert marker:text-primary max-w-none"
          content={JSON.parse(message.content)}
        />
      </div>
    </div>
  );
};

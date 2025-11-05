import Image from "next/image";
import React from "react";
import { format } from "date-fns";

interface iAppProps {
  id: number;
  message: string;
  date: Date;
  avatar: string;
  userName: string;
}
export const MessageItem = ({
  id,
  message,
  date,
  avatar,
  userName,
}: iAppProps) => {
  return (
    <div className="flex space-x-3 relative p-3 rounded-lg group hover:bg-muted/50">
      <Image
        src={avatar}
        alt="User Avatar"
        width={32}
        height={32}
        className="size-8 rounded-lg"
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-x-2">
          <p className="font-medium leading-none">{userName}</p>
          <p className="text-xs text-muted-foreground leading-none">
            {format(date, "d MMM yyyy h:mm a")}
          </p>
        </div>
        <p className="text-sm break-all max-w-none">{message}</p>
      </div>
    </div>
  );
};

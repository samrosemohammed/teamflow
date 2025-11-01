import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import React from "react";

const members = [
  {
    id: "1",
    name: "Alice",
    imageUrl: "https://avatars.githubusercontent.com/u/118836220?v=4",
    email: "example@gmail.com",
  },
  {
    id: "2",
    name: "Bob",
    imageUrl: "https://avatars.githubusercontent.com/u/118836220?v=4",
    email: "example@gmail.com",
  },
  {
    id: "3",
    name: "Charlie",
    imageUrl: "https://avatars.githubusercontent.com/u/118836220?v=4",
    email: "example@gmail.com",
  },
];
export const WorkspaceMembersList = () => {
  return (
    <div className="space-y-0.5 py-1">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer transition-colors space-x-3"
        >
          <div className="size-8 relative">
            <Avatar>
              <Image
                src={member.imageUrl}
                alt={`${member.name} User Profile`}
                className="object-cover"
                fill
              />
              <AvatarFallback>
                {member.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {member.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

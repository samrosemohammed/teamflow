import React from "react";
import { MessageItem } from "./message/message-item";

const messages = [
  {
    id: 1,
    message: "Hello, how are you?",
    date: new Date(),
    avatar: "https://avatars.githubusercontent.com/u/118836220?v=4",
    userName: "John Doe",
  },
];
export const MessageList = () => {
  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto px-4">
        {messages.map((msg) => (
          <MessageItem key={msg.id} {...msg} />
        ))}
      </div>
    </div>
  );
};

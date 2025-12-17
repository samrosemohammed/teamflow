import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/orpc";
import { eventIteratorToStream } from "@orpc/client";
import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageResponse } from "@/components/ui/ai-sdk-message";

interface SummarizeThreadProps {
  messageId: string;
}
export const SummarizeThread = ({ messageId }: SummarizeThreadProps) => {
  const [open, setOpen] = useState(false);
  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    stop,
    clearError,
  } = useChat({
    id: `thread-summary: ${messageId}`,
    transport: {
      async sendMessages(opt) {
        return eventIteratorToStream(
          await client.ai.thread.generate(
            {
              messageId: messageId,
            },
            { signal: opt.abortSignal }
          )
        );
      },
      reconnectToStream() {
        throw new Error("Unsupported");
      },
    },
  });
  const lastAssistent = messages.findLast((m) => m.role === "assistant");
  const summaryText =
    lastAssistent?.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n\n") ?? "";

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      const hasAssistantMessage = messages.some((m) => m.role === "assistant");
      if (status !== "ready" || hasAssistantMessage) {
        return;
      }
      sendMessage({ text: "Summarize Thread" });
    } else {
      stop();
      clearError();
      setMessages([]);
    }
  };
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size={"sm"}
          className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring rounded-full"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            <span className="text-xs font-medium">Summarize</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[25rem] p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 rounded-full inline-flex items-center justify-center gap-1.5">
              <Sparkles className="size-3.5 text-white" />
              <span className="text-sm font-medium">Ai Summary (Preview)</span>
            </span>
          </div>
          {status === "streaming" && (
            <Button
              type="button"
              size="sm"
              variant={"outline"}
              onClick={() => stop()}
            >
              Stop
            </Button>
          )}
        </div>
        <div className="px-4 py-3 max-h-80 overflow-y-auto">
          {error ? (
            <div>
              <p className="text-red-500">{error.message}</p>
              <Button
                type="button"
                size={"sm"}
                onClick={() => {
                  clearError();
                  setMessages([]);
                  sendMessage({ text: "Summarize Thread" });
                }}
              >
                Try Again
              </Button>
            </div>
          ) : summaryText ? (
            <MessageResponse parseIncompleteMarkdown={status !== "ready"}>
              {summaryText}
            </MessageResponse>
          ) : status === "submitted" || status === "streaming" ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Click Summarize to generate
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

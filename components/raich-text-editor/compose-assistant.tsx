import React, { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Sparkles } from "lucide-react";
import { MessageResponse } from "../ui/ai-sdk-message";
import { Skeleton } from "../ui/skeleton";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import { client } from "@/lib/orpc";

interface ComposeAssistantProps {
  content: string;
  onAccept: (markDown: string) => void;
}
export const ComposeAssistant = ({
  content,
  onAccept,
}: ComposeAssistantProps) => {
  const [open, setOpen] = useState(false);
  const conetentRef = useRef(content);
  useEffect(() => {
    conetentRef.current = content;
  }, [content]);
  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    stop,
    clearError,
  } = useChat({
    id: `compose-assistant`,
    transport: {
      async sendMessages(opt) {
        return eventIteratorToStream(
          await client.ai.compose.generate(
            { content: conetentRef.current },
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
  const composeText =
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
      sendMessage({ text: "Rewrite." });
    } else {
      stop();
      setMessages([]);
      clearError();
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
            <span className="text-xs font-medium">Compose</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[25rem] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 rounded-full inline-flex items-center justify-center gap-1.5">
              <Sparkles className="size-3.5 text-white" />
              <span className="text-sm font-medium">
                Compose Assistant (Preview)
              </span>
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
          ) : composeText ? (
            <MessageResponse parseIncompleteMarkdown={status !== "ready"}>
              {composeText}
            </MessageResponse>
          ) : status === "submitted" || status === "streaming" ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Click Compose to generate.
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 justify-end px-4 py-2 bg-muted/30 border-t">
          <Button
            type="button"
            size={"sm"}
            variant={"outline"}
            onClick={() => {
              stop();
              clearError();
              setMessages([]);
              setOpen(false);
            }}
          >
            Decline
          </Button>
          <Button
            onClick={() => {
              if (!composeText) return;
              onAccept?.(composeText);
              stop();
              clearError();
              setMessages([]);
              setOpen(false);
            }}
            type={"submit"}
            size={"sm"}
            disabled={!composeText}
          >
            Accept
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

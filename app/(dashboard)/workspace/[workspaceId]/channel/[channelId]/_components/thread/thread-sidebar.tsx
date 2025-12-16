import { Button } from "@/components/ui/button";
import { formatDate } from "date-fns";
import { ChevronDownIcon, MessageSquare, X } from "lucide-react";
import Image from "next/image";
import { ThreadReply } from "./thread-reply";
import { ThreadReplyForm } from "./thread-reply-form";
import { useThread } from "@/provider/thread-provider";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { SaveContent } from "@/components/raich-text-editor/save-content";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { ThreadSidebarSkeleton } from "./thread-sidebar-skeleton";
import { useEffect, useRef, useState } from "react";

interface ThreadSidebarProps {
  user: KindeUser<Record<string, unknown>>;
}
export const ThreadSidebar = ({ user }: ThreadSidebarProps) => {
  const { selectedThreadId, closeThread } = useThread();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastMessageCountRef = useRef<number>(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading } = useQuery(
    orpc.message.thread.list.queryOptions({
      input: {
        messageId: selectedThreadId!,
      },
      enabled: Boolean(selectedThreadId),
    })
  );
  const messageCount = data?.messages.length ?? 0;
  const isNearBottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= 80;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setIsAtBottom(isNearBottom(el));
  };

  useEffect(() => {
    if (messageCount === 0) return;
    const previousMessageCount = lastMessageCountRef.current;
    lastMessageCountRef.current = messageCount;
    const el = scrollRef.current;

    if (previousMessageCount > 0 && messageCount !== previousMessageCount) {
      if (el && isNearBottom(el)) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({
            block: "end",
            behavior: "smooth",
          });
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAtBottom(true);
      }
    }
    lastMessageCountRef.current = messageCount;
  }, [messageCount]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollToBottomIfNeeded = () => {
      if (isAtBottom) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ block: "end" });
        });
      }
    };
    const onImageLoad = (e: Event) => {
      if (e.target instanceof HTMLImageElement) {
        scrollToBottomIfNeeded();
      }
    };
    el.addEventListener("load", onImageLoad, true);

    // Resize Observer : Watch the resize of the container to adjust scroll
    const resizeObserver = new ResizeObserver(() => {
      scrollToBottomIfNeeded();
    });
    resizeObserver.observe(el);

    // Mutation Observer : Watch for DOM changes to adjust scroll
    const mutationObserver = new MutationObserver(() => {
      scrollToBottomIfNeeded();
    });
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("load", onImageLoad, true);
      mutationObserver.disconnect();
    };
  }, [isAtBottom]);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    setIsAtBottom(true);
  };

  if (isLoading) {
    return <ThreadSidebarSkeleton />;
  }
  return (
    <div className="w-[30rem] border-l flex flex-col h-full">
      {/* Header */}
      <div className="border-b h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4" />
          <span>Thread</span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={closeThread} variant={"outline"} size={"icon"}>
            <X className="size-4" />
          </Button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto"
        >
          {data && (
            <>
              <div className="p-4 border-b bg-muted/20">
                <div className="flex space-x-3">
                  <Image
                    src={data.parent.authorAvatar}
                    alt={data.parent.authorName}
                    width={40}
                    height={40}
                    className="size-8 rounded-full shrink-0"
                  />
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {data.parent.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(data.parent.createdAt, " MMM d, h:mm aa")}
                      </span>
                    </div>
                    <SaveContent
                      className="text-sm wrap-break-word prose dark:prose-invert"
                      content={JSON.parse(data.parent.content)}
                    />
                  </div>
                </div>
              </div>
              {/* Thread replies */}
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-4 px-2">
                  {data.messages.length} replies
                </p>
              </div>
              <div className="space-y-1">
                {data.messages.map((reply) => (
                  <ThreadReply
                    selectedThreadId={selectedThreadId!}
                    key={reply.id}
                    message={reply}
                  />
                ))}
              </div>
              <div ref={bottomRef}></div>
            </>
          )}
        </div>

        {/* Scroll to bottom button */}
        {!isAtBottom && (
          <Button
            type="button"
            size={"sm"}
            onClick={scrollToBottom}
            className="absolute bottom-4 right-5 size-10 rounded-full z-20 hover:shadow-xl transtion-all duration-200"
          >
            <ChevronDownIcon className="size-4" />
          </Button>
        )}
      </div>

      {/* Thread Reply form */}
      <div className="border-t p-4">
        <ThreadReplyForm user={user} threadId={selectedThreadId!} />
      </div>
    </div>
  );
};

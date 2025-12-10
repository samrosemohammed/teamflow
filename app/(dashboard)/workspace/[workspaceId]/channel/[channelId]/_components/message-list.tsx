"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageItem } from "./message/message-item";
import {
  useInfiniteQuery,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/general/empty-state";
import { ChevronDownIcon, Loader2 } from "lucide-react";

export const MessageList = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const lastItemRef = useRef<string | undefined>(undefined);
  const { channelId } = useParams<{ channelId: string }>();
  const infiniteOptions = orpc.message.list.infiniteOptions({
    input: (pageParam: string | undefined) => ({
      channelId: channelId,
      cursor: pageParam,
      limit: 10,
    }),
    queryKey: ["message.list", channelId],
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: [...data.pages]
        .map((p) => ({
          ...p,
          items: [...p.items].reverse(),
        }))
        .reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    ...infiniteOptions,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const {
    data: { user },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  // to scrol to the bottom when message first load
  useEffect(() => {
    if (!hasInitialScrolled && data?.pages.length) {
      const el = scrollRef.current;
      if (el) {
        bottomRef.current?.scrollIntoView({ block: "end" });
        setIsAtBottom(true);
      }
    }
  }, [hasInitialScrolled, data?.pages.length]);

  // keep view pinned to bottom on late content growth (eg. iamges)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollToBottomIfNeeded = () => {
      if (isAtBottom || !hasInitialScrolled) {
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
  }, [hasInitialScrolled, isAtBottom]);

  const isNearBottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= 80;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop <= 80 && hasNextPage && !isFetching) {
      const previousScrollHeight = el.scrollHeight;
      const previousScrollTop = el.scrollTop;
      fetchNextPage().then(() => {
        const newScrollHeight = el.scrollHeight;
        el.scrollTop =
          newScrollHeight - previousScrollHeight + previousScrollTop;
      });
    }
    setIsAtBottom(isNearBottom(el));
  };

  const items = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  const isEmpty = !isLoading && !error && items.length === 0;

  useEffect(() => {
    if (!items.length) return;
    const lastId = items[items.length - 1].id;
    const previousLastId = lastItemRef.current;
    const el = scrollRef.current;
    if (previousLastId && lastId !== previousLastId) {
      if (el && isNearBottom(el)) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });
        setIsAtBottom(true);
      }
    }
    lastItemRef.current = lastId;
  }, [items]);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    bottomRef.current?.scrollIntoView({ block: "end" });
    setIsAtBottom(true);
  };

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 flex flex-col space-y-1"
      >
        {isEmpty ? (
          <div className="flex h-full pt-4">
            <EmptyState
              title="No Message Yet"
              description="Start the conversation by sending the first messages"
              href="#"
              buttonText="Send a Message"
            />
          </div>
        ) : (
          items?.map((msg) => (
            <MessageItem currentUserId={user.id} key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef}></div>
      </div>
      {isFetchingNextPage && (
        <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex items-center justify-center py-2">
          <div className="flex items-center gap-2 rounded-md bg-gradient-to-b from-white/80 to-transparent dark:from-neutral-900/80 backdrop-blue px-3 py-1">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span>Loading previous messages...</span>
          </div>
        </div>
      )}

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
      {/* {newMessage && !isAtBottom ? (
        <Button
          className="absolute bottom-4 right-8 rounded-full"
          type="button"
          onClick={scrollToBottom}
        >
          New Messages
        </Button>
      ) : null} */}
    </div>
  );
};

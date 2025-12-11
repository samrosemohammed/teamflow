"use client";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { CreateMessageFormData, createMessageSchema } from "@/schemas/message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MessageComposser } from "../message/message-composer";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { orpc } from "@/lib/orpc";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { Message } from "@/app/generated/prisma/client";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";
import { MessageListItem } from "@/lib/types";

interface ThreadReplyFormProps {
  threadId: string;
  user: KindeUser<Record<string, unknown>>;
}
export const ThreadReplyForm = ({ threadId, user }: ThreadReplyFormProps) => {
  const { channelId } = useParams<{ channelId: string }>();
  const upload = useAttachmentUpload();
  const [editorKey, setEditorKey] = useState(0);
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      channelId: channelId,
      threadId: threadId,
    },
  });

  useEffect(() => {
    form.setValue("threadId", threadId);
  }, [threadId, form]);

  const createMessgaeMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        const listOptions = orpc.message.thread.list.queryOptions({
          input: {
            messageId: threadId,
          },
        });
        type MessagePage = {
          items: Array<MessageListItem>;
          nextCursor?: string;
        };
        type InfiniteMessages = InfiniteData<MessagePage>;
        await queryClient.cancelQueries({ queryKey: listOptions.queryKey });
        const previous = queryClient.getQueryData(listOptions.queryKey);
        const optimistic: Message = {
          id: `optimistic-${crypto.randomUUID()}`,
          content: data.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "John Fisher",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId: data.channelId,
          threadId: data.threadId!,
          imageUrl: data.imageUrl ?? null,
        };
        queryClient.setQueryData(listOptions.queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [...old.messages, optimistic],
          };
        });
        // Optimistically bump reliesCount in message.list cache
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (old) => {
            if (!old) return old;
            const pages = old.pages.map((p) => ({
              ...p,
              items: p.items.map((m) =>
                m.id === threadId
                  ? {
                      ...m,
                      repliesCount: m.repliesCount + 1,
                    }
                  : m
              ),
            }));
            return { ...old, pages };
          }
        );
        return {
          listOptions,
          previous,
        };
      },
      onSuccess: (_data, _vars, ctx) => {
        queryClient.invalidateQueries({ queryKey: ctx?.listOptions.queryKey });
        form.reset({
          channelId,
          content: "",
          threadId,
        });
        upload.clear();
        setEditorKey((k) => k + 1);
        return toast.success("Message created successfully");
      },
      onError: (_err, _vars, ctx) => {
        if (!ctx) return;
        const { listOptions, previous } = ctx;
        if (previous) {
          queryClient.setQueryData(listOptions.queryKey, previous);
        }
        toast.error(_err.message || "Failed to send message");
      },
    })
  );
  const onSubmit = (data: CreateMessageFormData) => {
    console.log(data);
    createMessgaeMutation.mutate({
      ...data,
      imageUrl: upload.stagedUrl ?? undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormControl>
              <MessageComposser
                value={field.value}
                onChange={field.onChange}
                upload={upload}
                key={editorKey}
                onSubmit={() => onSubmit(form.getValues())}
                isSubmitting={createMessgaeMutation.isPending}
              />
            </FormControl>
          )}
        />
      </form>
    </Form>
  );
};

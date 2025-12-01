"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CreateMessageFormData, createMessageSchema } from "@/schemas/message";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { MessageComposser } from "./message-composer";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { Message } from "@/app/generated/prisma/client";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";

interface iAppProps {
  channelId: string;
  user: KindeUser<Record<string, unknown>>;
}

type MessagePage = {
  items: Message[];
  nextCursor?: string;
};

type InfiniteMessage = InfiniteData<MessagePage>;
export const MessageInput = ({ channelId, user }: iAppProps) => {
  const queryClient = useQueryClient();
  const [editorKey, setEditorKey] = useState(0);
  const upload = useAttachmentUpload();
  const form = useForm({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      channelId: channelId,
    },
  });

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        await queryClient.cancelQueries({
          queryKey: ["message.list", channelId],
        });
        const previousData = queryClient.getQueryData<InfiniteMessage>([
          "message.list",
          channelId,
        ]);

        const tempId = `optmistic-${crypto.randomUUID()}`;
        const optmisticMessage: Message = {
          id: tempId,
          content: data.content,
          imageUrl: data.imageUrl || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          channelId: data.channelId,
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "John Doe",
          authorAvatar: getAvatar(user.picture, user.email!),
        };

        queryClient.setQueryData<InfiniteMessage>(
          ["message.list", channelId],
          (old) => {
            if (!old) {
              return {
                pages: [
                  {
                    items: [optmisticMessage],
                    nextCursor: undefined,
                  },
                ],
                pageParams: [undefined],
              } satisfies InfiniteMessage;
            }
            const firstPage = old.pages[0] ?? {
              items: [],
              nextCursor: undefined,
            };
            const updateFirstPage: MessagePage = {
              ...firstPage,
              items: [optmisticMessage, ...firstPage.items],
            };
            return {
              ...old,
              pages: [updateFirstPage, ...old.pages.slice(1)],
            };
          }
        );
        return {
          previousData,
          tempId,
        };
      },
      onSuccess: (data, _variables, context) => {
        queryClient.setQueryData<InfiniteMessage>(
          ["message.list", channelId],
          (old) => {
            if (!old) return old;
            const updatedPages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === context.tempId ? { ...data } : m
              ),
            }));

            return {
              ...old,
              pages: updatedPages,
            };
          }
        );
        form.reset({ channelId: channelId, content: "" });
        upload.clear();
        setEditorKey((k) => k + 1);
        return toast.success("Message sent successfully");
      },
      onError: (_err, _variables, _context) => {
        if (_context?.previousData) {
          queryClient.setQueryData(
            ["message.list", channelId],
            _context.previousData
          );
          return toast.error("Failed to send message.");
        }
      },
    })
  );
  const onSubmit = (value: CreateMessageFormData) => {
    createMessageMutation.mutate({
      ...value,
      imageUrl: upload.stagedUrl ?? undefined,
    });
    console.log("Submitting message:", value);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="content"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MessageComposser
                  key={editorKey}
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={() => onSubmit(form.getValues())}
                  isSubmitting={createMessageMutation.isPending}
                  upload={upload}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

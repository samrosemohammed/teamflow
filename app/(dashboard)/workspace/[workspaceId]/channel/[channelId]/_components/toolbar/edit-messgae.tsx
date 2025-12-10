"use client";
import { Message } from "@/app/generated/prisma/client";
import { RichTextEditor } from "@/components/raich-text-editor/editor";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { orpc } from "@/lib/orpc";
import { UpdateMessageFormData, updateMessageSchema } from "@/schemas/message";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface iAppProps {
  message: Message;
  onCancel: () => void;
  onSave: () => void;
}
export const EditMessage = ({ message, onCancel, onSave }: iAppProps) => {
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(updateMessageSchema),
    defaultValues: {
      messageId: message.id,
      content: message.content,
    },
  });

  const updateMutation = useMutation(
    orpc.message.update.mutationOptions({
      onSuccess: (updated) => {
        type MessagePage = {
          items: Message[];
          nextCursor?: string;
        };
        type InfiniteMessage = InfiniteData<MessagePage>;
        queryClient.setQueryData<InfiniteMessage>(
          ["message.list", message.channelId],
          (old) => {
            if (!old) return old;
            const updatedMessage = updated.message;
            const pages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m
              ),
            }));
            return {
              ...old,
              pages,
            };
          }
        );
        toast.success("Message updated successfully");
        onSave();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const onSubmit = (data: UpdateMessageFormData) => {
    console.log("Submitting updated message:", data);
    updateMutation.mutate(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RichTextEditor
                  field={field}
                  sendButton={
                    <div className="flex items-center gap-4">
                      <Button
                        disabled={updateMutation.isPending}
                        onClick={onCancel}
                        type="button"
                        size={"sm"}
                        variant={"outline"}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={updateMutation.isPending}
                        size={"sm"}
                        type="submit"
                      >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  }
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

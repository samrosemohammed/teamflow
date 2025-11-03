"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { orpc } from "@/lib/orpc";
import {
  ChannelFormData,
  channelNameSchema,
  transformChannelName,
} from "@/schemas/channel";
import { zodResolver } from "@hookform/resolvers/zod";
import { isDefinedError } from "@orpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const CreateNewChannel = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(channelNameSchema),
    defaultValues: {
      name: "",
    },
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedName = form.watch("name");
  const transformedName = watchedName ? transformChannelName(watchedName) : "";

  const createChannelMuation = useMutation(
    orpc.channel.create.mutationOptions({
      onSuccess: (newChannel) => {
        toast.success(`Channel "${newChannel.name}" created successfully!`);
        queryClient.invalidateQueries({
          queryKey: orpc.channel.list.queryKey(),
        });
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        if (isDefinedError(error)) {
          toast.error(`${error.message}`);
          return;
        }
        toast.error("An unexpected error occurred. Please try again.");
      },
    })
  );

  const onSubmit = (values: ChannelFormData) => {
    createChannelMuation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="w-full">
          <Plus className="size-4" />
          Add Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
          <DialogDescription>
            Create new channel to get started.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Channel" {...field} />
                  </FormControl>
                  {transformedName && transformedName !== watchedName && (
                    <p className="text-sm text-muted-foreground">
                      Will be created as:{" "}
                      <code className="px-1 py-0.5 rounded text-xs bg-muted">
                        {transformedName}
                      </code>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={createChannelMuation.isPending} type="submit">
              {createChannelMuation.isPending
                ? "Creating..."
                : "Create New Channel"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

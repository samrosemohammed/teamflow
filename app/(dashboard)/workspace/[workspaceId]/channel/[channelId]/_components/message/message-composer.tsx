import { RichTextEditor } from "@/components/raich-text-editor/editor";
import { Button } from "@/components/ui/button";
import { ImageIcon, Send } from "lucide-react";
import React from "react";

interface iAppProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}
export const MessageComposser = ({
  value,
  onChange,
  onSubmit,
  isSubmitting,
}: iAppProps) => {
  return (
    <>
      <RichTextEditor
        field={{
          value,
          onChange,
        }}
        sendButton={
          <Button
            type="button"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            <Send className="mr-1 size-4" />
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        }
        footerLeft={
          <Button type="button" size={"sm"} variant={"outline"}>
            <ImageIcon className="mr-1 size-4" /> Attach
          </Button>
        }
      />
    </>
  );
};

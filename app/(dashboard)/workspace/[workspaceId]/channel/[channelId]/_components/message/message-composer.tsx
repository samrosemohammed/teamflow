import { RichTextEditor } from "@/components/raich-text-editor/editor";
import { ImageUploadModal } from "@/components/raich-text-editor/image-upload-modal";
import { Button } from "@/components/ui/button";
import { UseAttachmentUpload } from "@/hooks/use-attachment-upload";
import { ImageIcon, Send } from "lucide-react";
import React from "react";
import { AttachmentChip } from "./attachment-chip";

interface iAppProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  upload: UseAttachmentUpload;
}
export const MessageComposser = ({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  upload,
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
          upload.stagedUrl ? (
            <AttachmentChip
              onRemove={upload.clear}
              imageUrl={upload.stagedUrl}
            />
          ) : (
            <Button
              onClick={() => upload?.setOpen(true)}
              type="button"
              size={"sm"}
              variant={"outline"}
            >
              <ImageIcon className="mr-1 size-4" /> Attach
            </Button>
          )
        }
      />
      <ImageUploadModal
        onUploaded={(url) => upload.onUploaded(url)}
        isOepn={upload.isOpen}
        onOpenChange={upload.setOpen}
      />
    </>
  );
};

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";

interface iAppProps {
  isOepn: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (url: string) => void;
}
export const ImageUploadModal = ({
  isOepn,
  onOpenChange,
  onUploaded,
}: iAppProps) => {
  return (
    <Dialog open={isOepn} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <UploadDropzone
          className="ut-uploading:opacity-90 ut-ready:bg-card ut-ready:border-border ut-ready:text-foreground ut-uploading:bg-muted ut-uploading:border-border ut-uploading:text-muted-foreground ut-label:text-sm ut-label:text-muted-foreground ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground ut-button:bg-primary rounded-lg border"
          appearance={{
            container: "bg-card",
            label: "text-muted-foreground",
            allowedContent: "text-xs text-muted-foreground",
            button: "bg-primary text-primary-foreground hover:bg-primary/90",
            uploadIcon: "text-muted-foreground",
          }}
          endpoint={"imageUploader"}
          onClientUploadComplete={(res) => {
            const url = res?.[0]?.ufsUrl;
            toast.success("Image uploaded successfully");
            onUploaded(url);
          }}
          onUploadError={(err) => {
            toast.error(err.message);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

"use client";

import { useCallback, useMemo, useState } from "react";

export const useAttachmentUpload = () => {
  const [isOpen, setOpen] = useState(false);
  const [stagedUrl, setStagedUrl] = useState<string | null>(null);
  const [isUplaoding, setIsUploading] = useState(false);
  const onUploaded = useCallback((url: string) => {
    setStagedUrl(url);
    setOpen(false);
    setIsUploading(false);
  }, []);

  const clear = useCallback(() => {
    setStagedUrl(null);
    setIsUploading(false);
  }, []);
  return useMemo(
    () => ({
      isOpen,
      setOpen,
      onUploaded,
      stagedUrl,
      isUplaoding,
      clear,
    }),
    [isOpen, setOpen, onUploaded, stagedUrl, isUplaoding, clear]
  );
};

export type UseAttachmentUpload = ReturnType<typeof useAttachmentUpload>;

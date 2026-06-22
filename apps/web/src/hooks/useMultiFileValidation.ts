"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export interface PhotoPreview {
  file: File;
  url: string;
}

interface UseMultiFileValidationOptions {
  maxCount: number;
  maxSizeBytes: number;
  allowedTypes: string[];
}

interface UseMultiFileValidationReturn {
  files: PhotoPreview[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  reset: () => void;
}

export function useMultiFileValidation(
  { maxCount, maxSizeBytes, allowedTypes }: UseMultiFileValidationOptions,
): UseMultiFileValidationReturn {
  const [files, setFiles] = useState<PhotoPreview[]>([]);

  const addFiles = useCallback((newFiles: File[]) => {
    const wrongType = newFiles.filter((f) => !allowedTypes.includes(f.type));
    const oversized = newFiles.filter((f) => allowedTypes.includes(f.type) && f.size > maxSizeBytes);
    const validFiles = newFiles.filter((f) => allowedTypes.includes(f.type) && f.size <= maxSizeBytes);

    if (wrongType.length > 0) {
      toast.error(`${wrongType.length} file dilewati karena format tidak didukung.`);
    }
    if (oversized.length > 0) {
      toast.error(`${oversized.length} foto dilewati karena ukurannya lebih dari ${Math.round(maxSizeBytes / 1024 / 1024)} MB.`);
    }

    setFiles((prev) => {
      const remainingSlots = maxCount - prev.length;
      const filesToAdd = validFiles.slice(0, Math.max(0, remainingSlots));
      if (validFiles.length > filesToAdd.length) {
        toast.error(`Maksimal ${maxCount} foto, sebagian foto dilewati.`);
      }
      const newPreviews = filesToAdd.map((file) => ({ file, url: URL.createObjectURL(file) }));
      return [...prev, ...newPreviews];
    });
  }, [maxCount, maxSizeBytes, allowedTypes]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const reset = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
  }, []);

  return { files, addFiles, removeFile, reset };
}

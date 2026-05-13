"use client";

import { useState, useCallback } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_SIZE = 1 * 1024 * 1024; // 1MB

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

interface UseFileValidationReturn {
  file: File | null;
  preview: string | null;
  error: string;
  validateAndSet: (file: File) => void;
  remove: () => void;
}

export function useFileValidation(): UseFileValidationReturn {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const validateAndSet = useCallback((selected: File) => {
    const ext = "." + selected.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(selected.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      setError("Format file harus JPG, PNG, atau GIF.");
      return;
    }

    if (selected.size > MAX_SIZE) {
      setError("Ukuran file maksimal 1MB.");
      return;
    }

    setError("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }, []);

  const remove = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError("");
  }, []);

  return { file, preview, error, validateAndSet, remove };
}

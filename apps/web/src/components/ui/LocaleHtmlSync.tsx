"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/stores/localeStore";

export const LocaleHtmlSync = () => {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
};

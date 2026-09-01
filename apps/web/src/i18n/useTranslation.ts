import { id } from "./id";
import { en } from "./en";
import { useLocaleStore } from "@/stores/localeStore";

const dictionaries = { id, en };

function resolve(dict: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
}

function interpolate(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  );
}

export function useTranslation() {
  const { locale, setLocale, toggleLocale } = useLocaleStore();

  const t = (path: string, vars?: Record<string, string | number>): string => {
    const value =
      resolve(dictionaries[locale], path) ?? resolve(dictionaries.id, path);
    if (typeof value !== "string") return path;
    return interpolate(value, vars);
  };

  return { t, locale, setLocale, toggleLocale };
}

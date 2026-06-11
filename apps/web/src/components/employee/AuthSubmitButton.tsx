import type { ReactNode } from "react";

interface AuthSubmitButtonProps {
  isLoading: boolean;
  children: ReactNode;
}

export function AuthSubmitButton({ isLoading, children }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
    >
      {isLoading ? (
        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}

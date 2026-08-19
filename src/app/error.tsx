"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-lg font-semibold">The dashboard could not load</h1>
        <p className="text-sm text-zinc-400">
          If this is a fresh deploy, run the SQL migrations in Supabase, then try again.
        </p>
        <p className="break-words text-xs text-zinc-500">{error.message}</p>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}

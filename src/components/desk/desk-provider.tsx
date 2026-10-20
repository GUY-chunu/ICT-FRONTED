import { useEffect, useState } from "react";
import { useDeskStore } from "@/lib/ict-store";
import { Skeleton } from "@/components/ui/skeleton";

export function DeskProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fallback = setTimeout(() => {
      if (cancelled) return;
      void useDeskStore.getState().bootstrapIfNeeded();
      setReady(true);
    }, 1200);

    void (async () => {
      try {
        await useDeskStore.persist.rehydrate();
        await useDeskStore.getState().fetchFromBackend();
      } catch (err) {
        console.warn("[DeskProvider] Rehydration note:", err);
      } finally {
        if (cancelled) return;
        await useDeskStore.getState().bootstrapIfNeeded();
        setReady(true);
        clearTimeout(fallback);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh bg-background p-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <p className="font-display text-2xl text-foreground">First Payout</p>
          <p className="text-sm text-muted-foreground">Connecting to ICT Terminal & syncing database…</p>
          <Skeleton className="h-12 w-48" />
          <div className="grid gap-3 sm:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";

export function AuthHydration({ children }: { children: React.ReactNode }) {
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);

  useEffect(() => {
    // Fetch data from backend on load
    useDataStore.getState().fetchAll();

    const finish = () => setHasHydrated(true);

    if (useAuthStore.persist.hasHydrated()) {
      finish();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(finish);
    void useAuthStore.persist.rehydrate();

    return unsub;
  }, [setHasHydrated]);

  return <>{children}</>;
}

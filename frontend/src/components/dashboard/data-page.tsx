"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchWithFallback } from "@/lib/api";

interface DataPageProps<T> {
  endpoint: string;
  fallback: T;
  children: (data: T, isMock: boolean) => React.ReactNode;
}

export function DataPage<T>({ endpoint, fallback, children }: DataPageProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const result = await fetchWithFallback(endpoint, fallback);
      if (mounted) {
        setData(result.data);
        setIsMock(result.isMock);
        setError(result.error || null);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [endpoint]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isMock && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <span>Unable to load live data. No sample records are being shown.</span>
          {error && <Badge variant="warning" className="ml-auto">{error}</Badge>}
        </div>
      )}
      {data && children(data, isMock)}
    </div>
  );
}

'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  /** Interval in milliseconds. Default: 30 000 (30s) */
  intervalMs?: number;
};

/**
 * AutoRefresh — mounts invisibly, calls router.refresh() on an interval.
 * Drop this into any Server Component layout or page to get auto-polling.
 * router.refresh() re-runs the server data-fetching without a full navigation.
 */
export default function AutoRefresh({ intervalMs = 30_000 }: Props) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}

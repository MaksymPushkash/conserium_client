"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";

import { installSessionSync } from "@/lib/session";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20_000,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => installSessionSync(queryClient), [queryClient]);

  useEffect(() => {
    const stored = window.localStorage.getItem("conserium-theme");
    const theme = stored === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

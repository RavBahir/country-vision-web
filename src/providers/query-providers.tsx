"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from "sonner";

export function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () => new QueryClient()
  );

  return (
      <>
      <Toaster />
    <QueryClientProvider client={queryClient}>
      {children}
            <ReactQueryDevtools position="right" initialIsOpen={false} />

    </QueryClientProvider>
      </>
  );
}
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/features/settings/hooks/use-theme";
import { TimerProvider } from "@/features/timer/providers/timer-provider";
import { VoiceProvider } from "@/features/voice/providers/voice-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TimerProvider>
          <VoiceProvider>{children}</VoiceProvider>
        </TimerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

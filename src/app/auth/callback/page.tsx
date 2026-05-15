"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startSession } from "@/lib/session";

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackShell />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}

function OAuthCallbackContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const accessToken = fragment.get("access_token") ?? query.get("access_token");

    if (!accessToken) {
      setError("Missing access token in OAuth callback.");
      return;
    }

    async function completeOAuthLogin(token: string) {
      try {
        startSession(queryClient, token);
        router.replace("/");
      } catch {
        setError("OAuth session refresh failed.");
      }
    }

    void completeOAuthLogin(accessToken);
  }, [queryClient, router]);

  return <CallbackShell error={error} />;
}

function CallbackShell({ error }: { error?: string | null }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Completing OAuth login</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-neutral-600">
          {error ?? "Completing the OAuth session and redirecting you back to Cortex."}
        </CardContent>
      </Card>
    </main>
  );
}

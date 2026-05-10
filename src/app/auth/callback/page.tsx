"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { refreshSession } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackShell />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}

function OAuthCallbackContent() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const accessToken = fragment.get("access_token") ?? query.get("access_token");
    const refreshToken = fragment.get("refresh_token") ?? query.get("refresh_token");

    if (!accessToken) {
      setError("Missing access token in OAuth callback.");
      return;
    }

    async function completeOAuthLogin(token: string) {
      try {
        if (refreshToken) {
          setSession(token, refreshToken);
        } else {
          const refreshed = await refreshSession();
          setSession(refreshed.access_token, refreshed.refresh_token);
        }
        router.replace("/");
      } catch {
        setError("OAuth session refresh failed.");
      }
    }

    void completeOAuthLogin(accessToken);
  }, [router, setSession]);

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

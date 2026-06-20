"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { getCurrentUser } from "@/lib/api";
import { refreshSessionOnce } from "@/lib/api/session-refresh";
import { useAuthStore } from "@/stores/auth-store";

export function isPublicRoute(pathname: string) {
  return pathname === "/" || pathname === "/privacy" || pathname === "/terms" || pathname.startsWith("/auth") || pathname.startsWith("/public");
}

export function useAuthenticatedUser(pathname: string) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const authHydrated = useAuthStore((state) => state.hydrated);
  const publicRoute = isPublicRoute(pathname);

  useEffect(() => {
    if (authHydrated) return;
    window.localStorage.removeItem("conserium-session");
    let active = true;
    refreshSessionOnce()
      .then((session) => {
        if (active && !useAuthStore.getState().accessToken) {
          useAuthStore.getState().setSession(session.access_token);
        }
      })
      .catch(() => {
        if (active && !useAuthStore.getState().accessToken) {
          useAuthStore.getState().clearSession();
        }
      })
      .finally(() => {
        if (active) useAuthStore.getState().setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, [authHydrated]);

  useEffect(() => {
    if (!authHydrated) return;
    if (!accessToken && !publicRoute) {
      router.replace("/auth");
    }
  }, [accessToken, authHydrated, publicRoute, router]);

  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: getCurrentUser,
    enabled: authHydrated && Boolean(accessToken) && !publicRoute,
  });

  return { accessToken, authHydrated, publicRoute, user: userQuery.data };
}

export function AuthGate({ accessToken, authHydrated, publicRoute, children }: { accessToken: string | null; authHydrated: boolean; publicRoute: boolean; children: ReactNode }) {
  if (publicRoute) {
    return <>{children}</>;
  }
  if (!authHydrated || !accessToken) {
    return <div className="min-h-screen bg-[#0b0b0b]" />;
  }
  return <>{children}</>;
}

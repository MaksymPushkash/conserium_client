"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { getCurrentUser } from "@/lib/api";
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

export function AuthGate({ authHydrated, publicRoute, children }: { authHydrated: boolean; publicRoute: boolean; children: ReactNode }) {
  if (publicRoute) {
    return <>{children}</>;
  }
  if (!authHydrated) {
    return <div className="min-h-screen bg-[#0b0b0d]" />;
  }
  return <>{children}</>;
}

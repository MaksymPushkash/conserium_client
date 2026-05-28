"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

import { AuthGate, useAuthenticatedUser } from "@/components/app-shell/auth-gate";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { Sidebar } from "@/components/app-shell/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { GlobalDropIngest } from "@/components/global-drop-ingest";
import { logout } from "@/lib/api";
import { endSession } from "@/lib/session";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { authHydrated, publicRoute, user } = useAuthenticatedUser(pathname);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      endSession(queryClient);
      router.replace("/auth");
    }
  }

  const displayName = user?.display_name || user?.email?.split("@")[0] || "Workspace";
  const email = user?.email || "";
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <AuthGate authHydrated={authHydrated} publicRoute={publicRoute}>
      {publicRoute ? (
        children
      ) : (
        <div className="min-h-screen bg-[var(--conserium-bg)] text-white">
          <Sidebar
            pathname={pathname}
            displayName={displayName}
            email={email}
            initial={initial}
            userMenuOpen={userMenuOpen}
            onUserMenuToggle={() => setUserMenuOpen((open) => !open)}
            onUserMenuClose={() => setUserMenuOpen(false)}
            onLogout={handleLogout}
            onNavigate={(href) => router.push(href)}
          />
          <MobileNav
            pathname={pathname}
            open={mobileNavOpen}
            onToggle={() => setMobileNavOpen((open) => !open)}
            onClose={() => setMobileNavOpen(false)}
            onLogout={handleLogout}
          />
          <CommandPalette />
          <GlobalDropIngest />
          <main className="transition-[padding] duration-300 md:pl-72">{children}</main>
        </div>
      )}
    </AuthGate>
  );
}

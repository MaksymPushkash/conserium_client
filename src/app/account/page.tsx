"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteCurrentUser, getCurrentUser, logout, logoutEverywhere } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { endSession } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountLoading />}>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const userQuery = useQuery({ queryKey: ["me"], queryFn: getCurrentUser });
  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      endSession(queryClient);
      router.replace("/auth");
    },
  });
  const logoutEverywhereMutation = useMutation({
    mutationFn: logoutEverywhere,
    onSettled: () => {
      endSession(queryClient);
      router.replace("/auth");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCurrentUser,
    onSuccess: () => {
      endSession(queryClient);
      router.replace("/auth");
    },
  });
  const oauthError = params.get("error");

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-normal tracking-normal">Account</h1>
        {oauthError ? <p className="font-jetbrains mt-2 text-xs text-red-400">OAuth error: {oauthError}</p> : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-neutral-300">
          {userQuery.error ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {errorMessage(userQuery.error)}
            </div>
          ) : (
            <>
              <Row label="email" value={userQuery.data?.email ?? "-"} />
              <Row label="name" value={userQuery.data?.display_name ?? "-"} />
              <Row label="created" value={userQuery.data ? formatDateTime(userQuery.data.created_at) : "-"} />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            Logout
          </Button>
          <Button
            variant="secondary"
            onClick={() => logoutEverywhereMutation.mutate()}
            disabled={logoutEverywhereMutation.isPending}
          >
            Logout everywhere
          </Button>
          <Button variant="danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4" />
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-normal tracking-normal">Account</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="font-jetbrains text-sm text-neutral-500">Loading account...</CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-5 border-b border-white/10 pb-3">
      <div className="font-jetbrains text-neutral-500">{label}</div>
      <div className="break-words text-neutral-100">{value}</div>
    </div>
  );
}

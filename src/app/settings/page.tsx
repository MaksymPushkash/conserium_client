"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteCurrentUser, getCurrentUser, getUserPreferences, logout, logoutEverywhere, updateUserPreferences } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { endSession } from "@/lib/session";
import type { AIPreferences, PrivacyPreferences, UserPreferences } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type SettingsTab = "appearance" | "account" | "privacy" | "ai";

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "appearance", label: "Appearance" },
  { id: "account", label: "About & account" },
  { id: "privacy", label: "Privacy" },
  { id: "ai", label: "AI" },
];

const defaultPreferences: UserPreferences = {
  appearance: { theme: "dark" },
  privacy: { share_usage_data: false, retain_query_history: true },
  ai: { answer_language: "match_question", retrieval_depth: "balanced" },
};

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const userQuery = useQuery({ queryKey: ["me"], queryFn: getCurrentUser });
  const preferencesQuery = useQuery({ queryKey: ["user-preferences"], queryFn: getUserPreferences });
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const updateMutation = useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: async (savedPreferences) => {
      setPreferences(savedPreferences);
      queryClient.setQueryData(["user-preferences"], savedPreferences);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  const logoutMutation = useMutation({
    mutationFn: logout,
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

  useEffect(() => {
    if (preferencesQuery.data) setPreferences(preferencesQuery.data);
  }, [preferencesQuery.data]);

  function updatePrivacy(nextPrivacy: PrivacyPreferences) {
    setPreferences((current) => ({ ...current, privacy: nextPrivacy }));
  }

  function updateAI(nextAI: AIPreferences) {
    setPreferences((current) => ({ ...current, ai: nextAI }));
  }

  const loadError = preferencesQuery.error ?? userQuery.error;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-normal tracking-normal">Settings</h1>
        <p className="font-jetbrains mt-2 text-xs text-neutral-500">Workspace preferences, account state, privacy, and AI behavior.</p>
      </header>

      {loadError ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage(loadError)}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Card>
          <CardContent className="grid gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeTab === tab.id ? "bg-white text-black" : "text-neutral-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </CardContent>
        </Card>

        {activeTab === "appearance" ? <AppearancePanel /> : null}
        {activeTab === "account" ? (
          <AccountPanel
            email={userQuery.data?.email ?? "-"}
            createdAt={userQuery.data?.created_at ?? null}
            logoutPending={logoutMutation.isPending}
            logoutEverywherePending={logoutEverywhereMutation.isPending}
            deletePending={deleteMutation.isPending}
            onLogout={() => logoutMutation.mutate()}
            onLogoutEverywhere={() => logoutEverywhereMutation.mutate()}
            onDeleteAccount={() => deleteMutation.mutate()}
          />
        ) : null}
        {activeTab === "privacy" ? <PrivacyPanel value={preferences.privacy} onChange={updatePrivacy} /> : null}
        {activeTab === "ai" ? <AIPanel value={preferences.ai} onChange={updateAI} /> : null}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => updateMutation.mutate(preferences)} disabled={updateMutation.isPending || preferencesQuery.isLoading}>
          {updateMutation.isPending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </div>
  );
}

function AppearancePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-neutral-300">
        <Field label="theme">
          <select className={selectClassName} value="dark" disabled>
            <option value="dark" className="bg-black text-neutral-200">Dark</option>
          </select>
        </Field>
        <p className="font-jetbrains text-xs leading-6 text-neutral-500">Dark is the only supported theme in this build.</p>
      </CardContent>
    </Card>
  );
}

function AccountPanel({
  email,
  createdAt,
  logoutPending,
  logoutEverywherePending,
  deletePending,
  onLogout,
  onLogoutEverywhere,
  onDeleteAccount,
}: {
  email: string;
  createdAt: string | null;
  logoutPending: boolean;
  logoutEverywherePending: boolean;
  deletePending: boolean;
  onLogout: () => void;
  onLogoutEverywhere: () => void;
  onDeleteAccount: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About & account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-neutral-300">
        <Row label="email" value={email} />
        <Row label="created" value={createdAt ? formatDateTime(createdAt) : "-"} />
        <Row label="version" value="v0.1.0" />
        <div className="flex flex-wrap gap-3 pt-3">
          <Button variant="secondary" onClick={onLogout} disabled={logoutPending}>
            Logout
          </Button>
          <Button variant="secondary" onClick={onLogoutEverywhere} disabled={logoutEverywherePending}>
            Logout everywhere
          </Button>
          <Button variant="danger" onClick={onDeleteAccount} disabled={deletePending}>
            <Trash2 className="h-4 w-4" />
            Delete account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PrivacyPanel({ value, onChange }: { value: PrivacyPreferences; onChange: (value: PrivacyPreferences) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-neutral-300">
        <Toggle
          label="Share anonymous usage data"
          checked={value.share_usage_data}
          onChange={(checked) => onChange({ ...value, share_usage_data: checked })}
        />
        <Toggle
          label="Retain query history"
          checked={value.retain_query_history}
          onChange={(checked) => onChange({ ...value, retain_query_history: checked })}
        />
      </CardContent>
    </Card>
  );
}

function AIPanel({ value, onChange }: { value: AIPreferences; onChange: (value: AIPreferences) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-neutral-300">
        <Field label="answer language">
          <select
            className={selectClassName}
            value={value.answer_language}
            onChange={(event) => onChange({ ...value, answer_language: event.target.value as AIPreferences["answer_language"] })}
          >
            <option value="match_question" className="bg-black text-neutral-200">Match question</option>
            <option value="english" className="bg-black text-neutral-200">English</option>
            <option value="ukrainian" className="bg-black text-neutral-200">Ukrainian</option>
          </select>
        </Field>
        <Field label="retrieval depth">
          <select
            className={selectClassName}
            value={value.retrieval_depth}
            onChange={(event) => onChange({ ...value, retrieval_depth: event.target.value as AIPreferences["retrieval_depth"] })}
          >
            <option value="focused" className="bg-black text-neutral-200">Focused</option>
            <option value="balanced" className="bg-black text-neutral-200">Balanced</option>
            <option value="broad" className="bg-black text-neutral-200">Broad</option>
          </select>
        </Field>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="font-jetbrains text-xs text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-white" />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-5 border-b border-white/10 pb-3">
      <div className="font-jetbrains text-neutral-500">{label}</div>
      <div className="break-words text-neutral-100">{value}</div>
    </div>
  );
}

const selectClassName = "h-10 rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-300 outline-none transition-colors focus:border-white/40 disabled:opacity-60";

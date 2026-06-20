"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  createNotionConnectUrl,
  createTelegramPairingCode,
  createApiKey,
  deleteCurrentUser,
  disconnectNotion,
  getCurrentUser,
  getNotionConnection,
  getStatsOverview,
  getTelegramStatus,
  getUserPreferences,
  importNotionPage,
  listAnswerShares,
  listApiKeys,
  logout,
  logoutEverywhere,
  revokeAnswerShare,
  revokeApiKey,
  revokeTelegramBinding,
  searchNotionPages,
  updateNotionConnectionSettings,
  updateUserPreferences,
} from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { endSession } from "@/lib/session";
import type { AIPreferences, NotionPage, PrivacyPreferences, UserPreferences } from "@/lib/types";

import { AccountPanel } from "./_components/account-panel";
import { AIPanel } from "./_components/ai-panel";
import { AppearancePanel } from "./_components/appearance-panel";
import { IntegrationsPanel } from "./_components/integrations-panel";
import { PrivacyPanel } from "./_components/privacy-panel";
import { SettingsTabs } from "./_components/settings-tabs";
import { defaultPreferences, tabs, type SettingsTab } from "./_components/settings-types";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialSettingsTab);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [notionParentPageId, setNotionParentPageId] = useState("");
  const [notionParentPageTitle, setNotionParentPageTitle] = useState("");
  const [notionPageQuery, setNotionPageQuery] = useState("");
  const [apiKeyName, setApiKeyName] = useState("");
  const [apiKeyScopes, setApiKeyScopes] = useState<string[]>(["ingest:write", "status:read", "collections:read"]);
  const [createdApiKeyToken, setCreatedApiKeyToken] = useState<string | null>(null);
  const [telegramPairingCode, setTelegramPairingCode] = useState<string | null>(null);
  const [telegramPairingExpiresAt, setTelegramPairingExpiresAt] = useState<string | null>(null);

  const userQuery = useQuery({ queryKey: ["me"], queryFn: getCurrentUser });
  const preferencesQuery = useQuery({ queryKey: ["user-preferences"], queryFn: getUserPreferences });
  const notionQuery = useQuery({ queryKey: ["integrations", "notion"], queryFn: getNotionConnection });
  const telegramQuery = useQuery({ queryKey: ["integrations", "telegram"], queryFn: getTelegramStatus });
  const apiKeysQuery = useQuery({ queryKey: ["api-keys"], queryFn: listApiKeys });
  const answerSharesQuery = useQuery({ queryKey: ["answer-shares"], queryFn: () => listAnswerShares({ limit: 25 }) });
  const statsQuery = useQuery({ queryKey: ["stats", "overview", "settings"], queryFn: getStatsOverview });

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
  const connectNotionMutation = useMutation({
    mutationFn: createNotionConnectUrl,
    onSuccess: (result) => {
      window.location.href = result.url;
    },
  });
  const disconnectNotionMutation = useMutation({
    mutationFn: disconnectNotion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["integrations", "notion"] }),
  });
  const updateNotionSettingsMutation = useMutation({
    mutationFn: updateNotionConnectionSettings,
    onSuccess: (connection) => {
      queryClient.setQueryData(["integrations", "notion"], connection);
    },
  });
  const searchNotionPagesMutation = useMutation({
    mutationFn: () => searchNotionPages({ query: notionPageQuery, limit: 10 }),
  });
  const importNotionPageMutation = useMutation({
    mutationFn: (page: NotionPage) => importNotionPage({ page_id: page.id, tags: ["notion"] }),
  });
  const createApiKeyMutation = useMutation({
    mutationFn: () => createApiKey({ name: apiKeyName, scopes: apiKeyScopes }),
    onSuccess: async (result) => {
      setCreatedApiKeyToken(result.token);
      setApiKeyName("");
      await queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
  const revokeApiKeyMutation = useMutation({
    mutationFn: revokeApiKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["api-keys"] }),
  });
  const revokeAnswerShareMutation = useMutation({
    mutationFn: revokeAnswerShare,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["answer-shares"] }),
  });
  const createTelegramPairingMutation = useMutation({
    mutationFn: createTelegramPairingCode,
    onSuccess: (result) => {
      setTelegramPairingCode(result.code);
      setTelegramPairingExpiresAt(result.expires_at);
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
  const revokeTelegramBindingMutation = useMutation({
    mutationFn: revokeTelegramBinding,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["integrations", "telegram"] });
      await queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  useEffect(() => {
    if (!preferencesQuery.data) return;
    const storedTheme = typeof window !== "undefined" ? window.localStorage.getItem("conserium-theme") : null;
    const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : preferencesQuery.data.appearance.theme;
    setPreferences({ ...preferencesQuery.data, appearance: { ...preferencesQuery.data.appearance, theme } });
    if (typeof window !== "undefined" && storedTheme !== "light" && storedTheme !== "dark") {
      window.localStorage.setItem("conserium-theme", theme);
      document.documentElement.dataset.theme = theme;
    }
  }, [preferencesQuery.data]);

  useEffect(() => {
    setNotionParentPageId(notionQuery.data?.default_parent_page_id ?? "");
    setNotionParentPageTitle(notionQuery.data?.default_parent_page_title ?? "");
  }, [notionQuery.data?.default_parent_page_id, notionQuery.data?.default_parent_page_title]);

  function updateAppearanceTheme(theme: "dark" | "light") {
    setPreferences((current) => ({ ...current, appearance: { ...current.appearance, theme } }));
    if (typeof window !== "undefined") {
      window.localStorage.setItem("conserium-theme", theme);
      document.documentElement.dataset.theme = theme;
    }
  }

  function updatePrivacy(nextPrivacy: PrivacyPreferences) {
    setPreferences((current) => ({ ...current, privacy: nextPrivacy }));
  }

  function updateAI(nextAI: AIPreferences) {
    setPreferences((current) => ({ ...current, ai: nextAI }));
  }

  const loadError =
    preferencesQuery.error ?? userQuery.error ?? notionQuery.error ?? telegramQuery.error ?? apiKeysQuery.error ?? answerSharesQuery.error;
  const actionError =
    connectNotionMutation.error ??
    disconnectNotionMutation.error ??
    updateNotionSettingsMutation.error ??
    searchNotionPagesMutation.error ??
    importNotionPageMutation.error ??
    createApiKeyMutation.error ??
    revokeApiKeyMutation.error ??
    revokeAnswerShareMutation.error ??
    createTelegramPairingMutation.error ??
    revokeTelegramBindingMutation.error;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-normal tracking-normal">Settings</h1>
        <p className="font-jetbrains mt-2 text-xs text-neutral-500">Workspace preferences, account state, privacy, and AI behavior.</p>
      </header>

      {loadError ? (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
          {errorMessage(loadError)}
        </div>
      ) : null}
      {actionError ? (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
          {errorMessage(actionError)}
        </div>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "appearance" ? <AppearancePanel theme={preferences.appearance.theme} onThemeChange={updateAppearanceTheme} /> : null}
        {activeTab === "account" ? (
          <AccountPanel
            email={userQuery.data?.email ?? "-"}
            createdAt={userQuery.data?.created_at ?? null}
            totalDocuments={statsQuery.data?.total_documents ?? null}
            readyDocuments={statsQuery.data?.ready_documents ?? null}
            processingDocuments={statsQuery.data?.processing_documents ?? null}
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
        {activeTab === "integrations" ? (
          <IntegrationsPanel
            notionConnected={notionQuery.data?.connected ?? false}
            notionWorkspace={notionQuery.data?.workspace_name ?? notionQuery.data?.workspace_id ?? null}
            parentPageId={notionParentPageId}
            parentPageTitle={notionParentPageTitle}
            pageQuery={notionPageQuery}
            pageResults={searchNotionPagesMutation.data ?? []}
            connectPending={connectNotionMutation.isPending}
            disconnectPending={disconnectNotionMutation.isPending}
            savePending={updateNotionSettingsMutation.isPending}
            searchPending={searchNotionPagesMutation.isPending}
            importPending={importNotionPageMutation.isPending}
            importedPageTitle={importNotionPageMutation.data?.document?.title ?? null}
            telegramBindings={telegramQuery.data?.bindings ?? []}
            telegramPairingCode={telegramPairingCode}
            telegramPairingExpiresAt={telegramPairingExpiresAt}
            createTelegramPairingPending={createTelegramPairingMutation.isPending}
            revokeTelegramBindingPending={revokeTelegramBindingMutation.isPending}
            apiKeys={apiKeysQuery.data?.items ?? []}
            answerShares={answerSharesQuery.data?.items ?? []}
            apiKeyName={apiKeyName}
            apiKeyScopes={apiKeyScopes}
            createdApiKeyToken={createdApiKeyToken}
            createApiKeyPending={createApiKeyMutation.isPending}
            revokeApiKeyPending={revokeApiKeyMutation.isPending}
            revokeAnswerSharePending={revokeAnswerShareMutation.isPending}
            onParentPageIdChange={(value) => {
              setNotionParentPageId(value);
              setNotionParentPageTitle("");
            }}
            onApiKeyNameChange={setApiKeyName}
            onApiKeyScopesChange={setApiKeyScopes}
            onCreateTelegramPairing={() => createTelegramPairingMutation.mutate()}
            onRevokeTelegramBinding={(id) => revokeTelegramBindingMutation.mutate(id)}
            onClearTelegramPairing={() => {
              setTelegramPairingCode(null);
              setTelegramPairingExpiresAt(null);
            }}
            onClearCreatedApiKey={() => setCreatedApiKeyToken(null)}
            onPageQueryChange={setNotionPageQuery}
            onSearchPages={() => searchNotionPagesMutation.mutate()}
            onImportPage={(page) => importNotionPageMutation.mutate(page)}
            onSelectPage={(page: NotionPage) => {
              setNotionParentPageId(page.id);
              setNotionParentPageTitle(page.title);
            }}
            onConnectNotion={() => connectNotionMutation.mutate()}
            onDisconnectNotion={() => disconnectNotionMutation.mutate()}
            onCreateApiKey={() => createApiKeyMutation.mutate()}
            onRevokeApiKey={(id) => revokeApiKeyMutation.mutate(id)}
            onRevokeAnswerShare={(slug) => revokeAnswerShareMutation.mutate(slug)}
            onSaveNotionSettings={() =>
              updateNotionSettingsMutation.mutate({
                default_parent_page_id: notionParentPageId.trim() || null,
                default_parent_page_title: notionParentPageTitle.trim() || null,
              })
            }
          />
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => updateMutation.mutate(preferences)} disabled={updateMutation.isPending || preferencesQuery.isLoading}>
          {updateMutation.isPending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </div>
  );
}

function initialSettingsTab(): SettingsTab {
  if (typeof window === "undefined") return "appearance";
  const hash = window.location.hash.replace("#", "");
  return tabs.some((tab) => tab.id === hash) ? (hash as SettingsTab) : "appearance";
}

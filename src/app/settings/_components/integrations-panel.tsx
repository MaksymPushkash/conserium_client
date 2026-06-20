"use client";

import { Bot, Check, Copy, ExternalLink, KeyRound, Link2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnswerShare, ApiKey, NotionPage, TelegramChatBinding } from "@/lib/types";

import { Field } from "./settings-primitives";

export function IntegrationsPanel({
  notionConnected,
  notionWorkspace,
  parentPageId,
  parentPageTitle,
  pageQuery,
  pageResults,
  connectPending,
  disconnectPending,
  savePending,
  searchPending,
  importPending,
  importedPageTitle,
  telegramBindings,
  telegramPairingCode,
  telegramPairingExpiresAt,
  createTelegramPairingPending,
  revokeTelegramBindingPending,
  apiKeys,
  answerShares,
  apiKeyName,
  apiKeyScopes,
  createdApiKeyToken,
  createApiKeyPending,
  revokeApiKeyPending,
  revokeAnswerSharePending,
  onParentPageIdChange,
  onApiKeyNameChange,
  onApiKeyScopesChange,
  onCreateTelegramPairing,
  onRevokeTelegramBinding,
  onClearTelegramPairing,
  onClearCreatedApiKey,
  onPageQueryChange,
  onSearchPages,
  onImportPage,
  onSelectPage,
  onConnectNotion,
  onDisconnectNotion,
  onCreateApiKey,
  onRevokeApiKey,
  onRevokeAnswerShare,
  onSaveNotionSettings,
}: {
  notionConnected: boolean;
  notionWorkspace: string | null;
  parentPageId: string;
  parentPageTitle: string;
  pageQuery: string;
  pageResults: NotionPage[];
  connectPending: boolean;
  disconnectPending: boolean;
  savePending: boolean;
  searchPending: boolean;
  importPending: boolean;
  importedPageTitle: string | null;
  telegramBindings: TelegramChatBinding[];
  telegramPairingCode: string | null;
  telegramPairingExpiresAt: string | null;
  createTelegramPairingPending: boolean;
  revokeTelegramBindingPending: boolean;
  apiKeys: ApiKey[];
  answerShares: AnswerShare[];
  apiKeyName: string;
  apiKeyScopes: string[];
  createdApiKeyToken: string | null;
  createApiKeyPending: boolean;
  revokeApiKeyPending: boolean;
  revokeAnswerSharePending: boolean;
  onParentPageIdChange: (value: string) => void;
  onApiKeyNameChange: (value: string) => void;
  onApiKeyScopesChange: (value: string[]) => void;
  onCreateTelegramPairing: () => void;
  onRevokeTelegramBinding: (id: string) => void;
  onClearTelegramPairing: () => void;
  onClearCreatedApiKey: () => void;
  onPageQueryChange: (value: string) => void;
  onSearchPages: () => void;
  onImportPage: (page: NotionPage) => void;
  onSelectPage: (page: NotionPage) => void;
  onConnectNotion: () => void;
  onDisconnectNotion: () => void;
  onCreateApiKey: () => void;
  onRevokeApiKey: (id: string) => void;
  onRevokeAnswerShare: (slug: string) => void;
  onSaveNotionSettings: () => void;
}) {
  const [copiedShareSlug, setCopiedShareSlug] = useState<string | null>(null);
  const [pendingRevokeSlug, setPendingRevokeSlug] = useState<string | null>(null);
  const [answerShareFilter, setAnswerShareFilter] = useState<"active" | "revoked" | "all">("active");
  const filteredAnswerShares = useMemo(() => {
    if (answerShareFilter === "all") return answerShares;
    return answerShares.filter((share) => (answerShareFilter === "revoked" ? Boolean(share.revoked_at) : !share.revoked_at));
  }, [answerShareFilter, answerShares]);

  function copyShareUrl(slug: string, url: string) {
    void navigator.clipboard.writeText(url);
    setCopiedShareSlug(slug);
    window.setTimeout(() => setCopiedShareSlug((current) => (current === slug ? null : current)), 1500);
  }

  function confirmRevokeShare(slug: string) {
    onRevokeAnswerShare(slug);
    setPendingRevokeSlug(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-neutral-300">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3">
          <div>
            <div className="text-neutral-100">Notion</div>
            <div className="font-jetbrains mt-1 text-xs text-neutral-500">
              {notionConnected ? `Connected${notionWorkspace ? ` · ${notionWorkspace}` : ""}` : "Not connected"}
            </div>
          </div>
          {notionConnected ? (
            <Button variant="secondary" onClick={onDisconnectNotion} disabled={disconnectPending}>
              Disconnect
            </Button>
          ) : (
            <Button onClick={onConnectNotion} disabled={connectPending}>
              <Link2 className="h-4 w-4" />
              Connect
            </Button>
          )}
        </div>
        {notionConnected ? (
          <div className="space-y-3 rounded-md border border-white/10 bg-white/[0.03] p-3">
            <Field label="default parent page id">
              <input
                value={parentPageId}
                onChange={(event) => onParentPageIdChange(event.target.value)}
                placeholder="Notion page id"
                className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition-colors focus:border-white/40"
              />
            </Field>
            {parentPageTitle ? (
              <div className="rounded-md border border-white/10 bg-black p-3">
                <div className="font-jetbrains text-xs text-neutral-500">selected parent page</div>
                <div className="mt-1 text-neutral-100">{parentPageTitle}</div>
              </div>
            ) : null}
            {importedPageTitle ? (
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
                Imported {importedPageTitle}.
              </div>
            ) : null}
            <div className="grid gap-2">
              <span className="font-jetbrains text-xs text-neutral-500">find parent page</span>
              <div className="flex gap-2">
                <input
                  value={pageQuery}
                  onChange={(event) => onPageQueryChange(event.target.value)}
                  placeholder="Search pages"
                  className="h-10 min-w-0 flex-1 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition-colors focus:border-white/40"
                />
                <Button variant="secondary" onClick={onSearchPages} disabled={searchPending}>
                  {searchPending ? "Searching..." : "Search"}
                </Button>
              </div>
              {pageResults.length ? (
                <div className="grid gap-2">
                  {pageResults.map((page) => (
                    <div
                      key={page.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 p-3"
                    >
                      <button type="button" onClick={() => onSelectPage(page)} className="min-w-0 text-left">
                        <div className="text-neutral-100">{page.title}</div>
                        <div className="font-jetbrains mt-1 break-all text-xs text-neutral-500">{page.id}</div>
                      </button>
                      <Button variant="secondary" onClick={() => onImportPage(page)} disabled={importPending}>
                        {importPending ? "Importing..." : "Import"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={onSaveNotionSettings} disabled={savePending}>
                Save Notion settings
              </Button>
            </div>
          </div>
        ) : null}
        <div className="space-y-3 rounded-md border border-white/10 bg-white/[0.03] p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-neutral-100">Telegram bot</div>
              <div className="font-jetbrains mt-1 text-xs text-neutral-500">Generate a short pairing code, send it to the Conserium Telegram bot, then revoke access here.</div>
            </div>
            <Bot className="h-4 w-4 text-neutral-500" />
          </div>
          {telegramPairingCode ? (
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="font-jetbrains text-xs text-neutral-400">send this to the Telegram bot</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="rounded-md bg-black px-3 py-2 font-jetbrains text-lg text-neutral-100">/pair {telegramPairingCode}</code>
                <Button variant="secondary" onClick={() => navigator.clipboard.writeText(`/pair ${telegramPairingCode}`)}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button variant="secondary" onClick={onClearTelegramPairing}>
                  Done
                </Button>
              </div>
              <div className="font-jetbrains mt-2 text-xs text-neutral-400">Expires {formatDate(telegramPairingExpiresAt)}</div>
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button onClick={onCreateTelegramPairing} disabled={createTelegramPairingPending}>
              {createTelegramPairingPending ? "Generating..." : "Generate pairing code"}
            </Button>
          </div>
          {telegramBindings.length ? (
            <div className="grid gap-2">
              {telegramBindings.map((binding) => (
                <div key={binding.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-black p-3">
                  <div>
                    <div className="text-neutral-100">{binding.chat_title || binding.chat_username || binding.chat_id}</div>
                    <div className="font-jetbrains mt-1 text-xs text-neutral-500">
                      chat {binding.chat_id} · paired {formatDate(binding.paired_at)}
                      {binding.revoked_at ? ` · revoked ${formatDate(binding.revoked_at)}` : ""}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => onRevokeTelegramBinding(binding.id)}
                    disabled={revokeTelegramBindingPending || Boolean(binding.revoked_at)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {binding.revoked_at ? "Revoked" : "Revoke"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-white/10 p-3 text-sm text-neutral-500">No Telegram chats paired.</div>
          )}
        </div>
        <div className="space-y-3 rounded-md border border-white/10 bg-white/[0.03] p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-neutral-100">Public API keys</div>
              <div className="font-jetbrains mt-1 text-xs text-neutral-500">
                Use scoped keys for browser extensions, webhooks, Telegram, and automation tools.
              </div>
            </div>
            <KeyRound className="h-4 w-4 text-neutral-500" />
          </div>
          {createdApiKeyToken ? (
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="font-jetbrains text-xs text-neutral-400">copy this token now</div>
              <div className="mt-2 break-all rounded-md bg-black p-2 font-jetbrains text-xs text-neutral-100">{createdApiKeyToken}</div>
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => navigator.clipboard.writeText(createdApiKeyToken)}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button variant="secondary" onClick={onClearCreatedApiKey}>
                  Done
                </Button>
              </div>
            </div>
          ) : null}
          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
              <input
                value={apiKeyName}
                onChange={(event) => onApiKeyNameChange(event.target.value)}
                placeholder="Telegram bot, browser extension, n8n"
                className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition-colors focus:border-white/40"
              />
              <Button onClick={onCreateApiKey} disabled={createApiKeyPending || !apiKeyName.trim() || apiKeyScopes.length === 0}>
                {createApiKeyPending ? "Creating..." : "Create key"}
              </Button>
            </div>
            <div className="grid gap-2 rounded-md border border-white/10 bg-black p-3">
              <div className="font-jetbrains text-xs uppercase tracking-[0.28em] text-neutral-500">Scopes</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {apiKeyScopeOptions.map((option) => (
                  <label key={option.value} className="flex items-start gap-2 rounded-md border border-white/10 bg-white/[0.03] p-2 text-xs text-neutral-300">
                    <input
                      type="checkbox"
                      checked={apiKeyScopes.includes(option.value)}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...apiKeyScopes, option.value]
                          : apiKeyScopes.filter((scope) => scope !== option.value);
                        onApiKeyScopesChange(next);
                      }}
                      className="mt-0.5 h-4 w-4 accent-white"
                    />
                    <span>
                      <span className="block text-neutral-100">{option.label}</span>
                      <span className="font-jetbrains mt-1 block text-[11px] text-neutral-500">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {apiKeys.length ? (
            <div className="grid gap-2">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-black p-3">
                  <div>
                    <div className="text-neutral-100">{apiKey.name}</div>
                    <div className="font-jetbrains mt-1 text-xs text-neutral-500">
                      {apiKey.prefix}... · {apiKey.scopes.join(", ")} · last used {formatDate(apiKey.last_used_at)}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => onRevokeApiKey(apiKey.id)}
                    disabled={revokeApiKeyPending || Boolean(apiKey.revoked_at)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {apiKey.revoked_at ? "Revoked" : "Revoke"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-white/10 p-3 text-sm text-neutral-500">
              No API keys yet.
            </div>
          )}
        </div>
        <div className="space-y-3 rounded-md border border-white/10 bg-white/[0.03] p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-neutral-100">Shared answers</div>
              <div className="font-jetbrains mt-1 text-xs text-neutral-500">Manage public answer URLs created from collection Ask and chat responses.</div>
            </div>
            <Link2 className="h-4 w-4 text-neutral-500" />
          </div>
          {answerShares.length ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {answerShareFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setAnswerShareFilter(filter.value)}
                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      answerShareFilter === filter.value
                        ? "border-white/30 bg-white/[0.12] text-neutral-100"
                        : "border-white/10 bg-transparent text-neutral-500 hover:border-white/20 hover:text-neutral-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              {filteredAnswerShares.length ? (
                <div className="grid gap-2">
                  {filteredAnswerShares.map((share) => {
                    const publicUrl = typeof window === "undefined" ? share.url_path : `${window.location.origin}${share.url_path}`;
                    const copied = copiedShareSlug === share.slug;
                    const revoked = Boolean(share.revoked_at);
                    const needsConfirmation = pendingRevokeSlug === share.slug;
                    return (
                      <div key={share.slug} className="grid gap-3 rounded-md border border-white/10 bg-black p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="max-w-full truncate text-neutral-100">{share.query}</span>
                            <span
                              className={`rounded-md border px-2 py-0.5 font-jetbrains text-[10px] uppercase tracking-[0.18em] ${
                                revoked ? "border-white/10 text-neutral-500" : "border-white/20 text-neutral-200"
                              }`}
                            >
                              {revoked ? "Revoked" : "Active"}
                            </span>
                          </div>
                          <div className="font-jetbrains text-xs text-neutral-500">
                            {share.collection_name ? `${share.collection_name} · ` : share.public_collection_slug ? `public collection ${share.public_collection_slug} · ` : "manual share · "}
                            created {formatDate(share.created_at)}
                            {share.revoked_at ? ` · revoked ${formatDate(share.revoked_at)}` : ""}
                          </div>
                          <div className="font-jetbrains truncate text-xs text-neutral-600">{publicUrl}</div>
                          {share.collection_id ? (
                            <Link
                              href={`/collections/${share.collection_id}`}
                              className="inline-flex items-center gap-1 text-xs text-neutral-400 transition-colors hover:text-neutral-100"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Open source collection
                            </Link>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {needsConfirmation ? (
                            <>
                              <Button variant="secondary" onClick={() => setPendingRevokeSlug(null)}>
                                Cancel
                              </Button>
                              <Button variant="secondary" onClick={() => confirmRevokeShare(share.slug)} disabled={revokeAnswerSharePending}>
                                Confirm revoke
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="secondary" onClick={() => copyShareUrl(share.slug, publicUrl)} disabled={revoked}>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied ? "Copied" : "Copy URL"}
                              </Button>
                              <Button
                                variant="secondary"
                                aria-label={`Revoke shared answer: ${share.query}`}
                                onClick={() => setPendingRevokeSlug(share.slug)}
                                disabled={revokeAnswerSharePending || revoked}
                              >
                                <Trash2 className="h-4 w-4" />
                                {revoked ? "Revoked" : "Revoke"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-white/10 p-3 text-sm text-neutral-500">
                  No {answerShareFilter === "revoked" ? "revoked" : "active"} shared answers.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-white/10 p-3 text-sm text-neutral-500">
              No shared answers yet. Public Ask answers and manually shared chat answers will appear here.
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}

const apiKeyScopeOptions = [
  { value: "ingest:write", label: "Ingest", description: "Create documents from webhooks, Telegram, extension, or scripts." },
  { value: "status:read", label: "Status", description: "Read intake and document processing status after saving." },
  { value: "collections:read", label: "Collections", description: "Load collection pickers in extensions and automations." },
  { value: "query:write", label: "Query", description: "Ask scoped questions through the public API." },
];

const answerShareFilters: Array<{ value: "active" | "revoked" | "all"; label: string }> = [
  { value: "active", label: "Active" },
  { value: "revoked", label: "Revoked" },
  { value: "all", label: "All" },
];

function formatDate(value: string | null) {
  if (!value) return "never";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

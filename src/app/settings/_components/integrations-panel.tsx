import { Copy, KeyRound, Link2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiKey, NotionPage } from "@/lib/types";

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
  apiKeys,
  apiKeyName,
  createdApiKeyToken,
  createApiKeyPending,
  revokeApiKeyPending,
  onParentPageIdChange,
  onApiKeyNameChange,
  onClearCreatedApiKey,
  onPageQueryChange,
  onSearchPages,
  onImportPage,
  onSelectPage,
  onConnectNotion,
  onDisconnectNotion,
  onCreateApiKey,
  onRevokeApiKey,
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
  apiKeys: ApiKey[];
  apiKeyName: string;
  createdApiKeyToken: string | null;
  createApiKeyPending: boolean;
  revokeApiKeyPending: boolean;
  onParentPageIdChange: (value: string) => void;
  onApiKeyNameChange: (value: string) => void;
  onClearCreatedApiKey: () => void;
  onPageQueryChange: (value: string) => void;
  onSearchPages: () => void;
  onImportPage: (page: NotionPage) => void;
  onSelectPage: (page: NotionPage) => void;
  onConnectNotion: () => void;
  onDisconnectNotion: () => void;
  onCreateApiKey: () => void;
  onRevokeApiKey: (id: string) => void;
  onSaveNotionSettings: () => void;
}) {
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
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
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
              <div className="text-neutral-100">Public API keys</div>
              <div className="font-jetbrains mt-1 text-xs text-neutral-500">
                Use scoped keys for browser extensions, webhooks, Telegram, and automation tools.
              </div>
            </div>
            <KeyRound className="h-4 w-4 text-neutral-500" />
          </div>
          {createdApiKeyToken ? (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="font-jetbrains text-xs text-emerald-200">copy this token now</div>
              <div className="mt-2 break-all rounded-md bg-black p-2 font-jetbrains text-xs text-emerald-50">{createdApiKeyToken}</div>
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
          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
            <input
              value={apiKeyName}
              onChange={(event) => onApiKeyNameChange(event.target.value)}
              placeholder="Telegram bot, browser extension, n8n"
              className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition-colors focus:border-white/40"
            />
            <Button onClick={onCreateApiKey} disabled={createApiKeyPending || !apiKeyName.trim()}>
              {createApiKeyPending ? "Creating..." : "Create key"}
            </Button>
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
      </CardContent>
    </Card>
  );
}

function formatDate(value: string | null) {
  if (!value) return "never";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

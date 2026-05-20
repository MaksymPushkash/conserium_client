import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NotionPage } from "@/lib/types";

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
  onParentPageIdChange,
  onPageQueryChange,
  onSearchPages,
  onSelectPage,
  onConnectNotion,
  onDisconnectNotion,
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
  onParentPageIdChange: (value: string) => void;
  onPageQueryChange: (value: string) => void;
  onSearchPages: () => void;
  onSelectPage: (page: NotionPage) => void;
  onConnectNotion: () => void;
  onDisconnectNotion: () => void;
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
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => onSelectPage(page)}
                      className="rounded-md border border-white/10 p-3 text-left transition-colors hover:border-white/30"
                    >
                      <div className="text-neutral-100">{page.title}</div>
                      <div className="font-jetbrains mt-1 break-all text-xs text-neutral-500">{page.id}</div>
                    </button>
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
      </CardContent>
    </Card>
  );
}

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

import { Row } from "./settings-primitives";

export function AccountPanel({
  email,
  createdAt,
  totalDocuments,
  readyDocuments,
  processingDocuments,
  logoutPending,
  logoutEverywherePending,
  deletePending,
  onLogout,
  onLogoutEverywhere,
  onDeleteAccount,
}: {
  email: string;
  createdAt: string | null;
  totalDocuments: number | null;
  readyDocuments: number | null;
  processingDocuments: number | null;
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
        <Row label="plan" value="Free" />
        <Row label="documents" value={documentSummary(totalDocuments, readyDocuments, processingDocuments)} />
        <Row label="storage" value="Calculated after file storage metrics are enabled" />
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

function documentSummary(total: number | null, ready: number | null, processing: number | null): string {
  if (total === null) return "-";
  return `${total} total · ${ready ?? 0} ready · ${processing ?? 0} processing`;
}

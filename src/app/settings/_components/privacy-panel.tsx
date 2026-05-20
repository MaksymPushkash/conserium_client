import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Toggle } from "./settings-primitives";
import type { PrivacyPreferences } from "./settings-types";

export function PrivacyPanel({ value, onChange }: { value: PrivacyPreferences; onChange: (value: PrivacyPreferences) => void }) {
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

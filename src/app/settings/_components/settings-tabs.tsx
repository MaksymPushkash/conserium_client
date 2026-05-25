import { Card, CardContent } from "@/components/ui/card";

import type { SettingsTab } from "./settings-types";
import { tabs } from "./settings-types";

export function SettingsTabs({ activeTab, onChange }: { activeTab: SettingsTab; onChange: (tab: SettingsTab) => void }) {
  return (
    <Card>
      <CardContent className="grid gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`h-11 rounded-md border px-3 text-left text-sm transition-colors ${
              activeTab === tab.id
                ? "border-white/25 bg-white/[0.08] text-white"
                : "border-transparent text-neutral-400 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

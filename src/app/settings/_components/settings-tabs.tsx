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
            className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
              activeTab === tab.id ? "bg-white text-black" : "text-neutral-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

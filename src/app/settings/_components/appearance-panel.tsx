import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Field, selectClassName } from "./settings-primitives";

export function AppearancePanel({
  theme,
  onThemeChange,
}: {
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-neutral-300">
        <Field label="theme">
          <select className={selectClassName} value={theme} onChange={(event) => onThemeChange(event.target.value as "dark" | "light")}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </Field>
        <p className="font-jetbrains text-xs leading-6 text-neutral-500">Theme applies immediately and is saved with workspace preferences.</p>
      </CardContent>
    </Card>
  );
}

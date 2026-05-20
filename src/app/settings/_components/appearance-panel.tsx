import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Field, selectClassName } from "./settings-primitives";

export function AppearancePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-neutral-300">
        <Field label="theme">
          <select className={selectClassName} value="dark" disabled>
            <option value="dark" className="bg-black text-neutral-200">
              Dark
            </option>
          </select>
        </Field>
        <p className="font-jetbrains text-xs leading-6 text-neutral-500">Dark is the only supported theme in this build.</p>
      </CardContent>
    </Card>
  );
}

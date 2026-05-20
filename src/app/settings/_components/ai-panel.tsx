import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Field, selectClassName } from "./settings-primitives";
import type { AIPreferences } from "./settings-types";

export function AIPanel({ value, onChange }: { value: AIPreferences; onChange: (value: AIPreferences) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-neutral-300">
        <Field label="answer language">
          <select
            className={selectClassName}
            value={value.answer_language}
            onChange={(event) => onChange({ ...value, answer_language: event.target.value as AIPreferences["answer_language"] })}
          >
            <option value="match_question" className="bg-black text-neutral-200">
              Match question
            </option>
            <option value="english" className="bg-black text-neutral-200">
              English
            </option>
            <option value="ukrainian" className="bg-black text-neutral-200">
              Ukrainian
            </option>
          </select>
        </Field>
        <Field label="retrieval depth">
          <select
            className={selectClassName}
            value={value.retrieval_depth}
            onChange={(event) => onChange({ ...value, retrieval_depth: event.target.value as AIPreferences["retrieval_depth"] })}
          >
            <option value="focused" className="bg-black text-neutral-200">
              Focused
            </option>
            <option value="balanced" className="bg-black text-neutral-200">
              Balanced
            </option>
            <option value="broad" className="bg-black text-neutral-200">
              Broad
            </option>
          </select>
        </Field>
      </CardContent>
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RouteError({ title, error, reset }: { title: string; error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <Card className="border-red-500/30 bg-red-500/[0.04]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-jetbrains text-sm text-red-200">{error.message || "Page failed to render."}</p>
          <Button variant="secondary" onClick={reset}>Retry</Button>
        </CardContent>
      </Card>
    </div>
  );
}

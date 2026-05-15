import { cn } from "@/lib/utils";

interface DocumentActivityIndicatorProps {
  temperature: string;
}

const labels: Record<string, string> = {
  hot: "hot",
  cold: "cold",
  forgotten: "forgotten",
};

const styles: Record<string, string> = {
  hot: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  cold: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  forgotten: "border-neutral-500/30 bg-neutral-500/10 text-neutral-400",
};

export function DocumentActivityIndicator({ temperature }: DocumentActivityIndicatorProps) {
  return (
    <span
      className={cn(
        "font-jetbrains inline-flex h-6 items-center rounded-md border px-2 text-[10px] uppercase",
        styles[temperature] ?? styles.forgotten,
      )}
    >
      {labels[temperature] ?? temperature}
    </span>
  );
}

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
  hot: "border-white/20 bg-white/[0.07] text-neutral-100",
  cold: "border-neutral-500/30 bg-neutral-500/10 text-neutral-300",
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

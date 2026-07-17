import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bg-gray-800 animate-pulse rounded-md", className)} />;
}

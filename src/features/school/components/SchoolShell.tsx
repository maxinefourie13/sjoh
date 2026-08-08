import { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Skeleton } from "@/components/ui/skeleton";

export function SchoolShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

export function SchoolLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Grid3X3, Bell, Clock } from "lucide-react";

export function AppTopbar({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-sidebar px-4 text-sidebar-foreground">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Back to app launcher"
          className="rounded-md p-2 transition-colors hover:bg-sidebar-accent"
        >
          <Grid3X3 className="h-5 w-5" />
        </Link>
        {title ? <span className="text-sm font-semibold tracking-wide">{title}</span> : null}
      </div>
      <div className="flex items-center gap-4">
        <Clock className="h-4 w-4 opacity-80" />
        <div className="relative">
          <Bell className="h-4 w-4 opacity-80" />
          <span className="absolute -top-2 -right-2 rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
            8
          </span>
        </div>
        <span className="text-sm font-bold tracking-wider uppercase">Suzuki Egypt</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-sidebar-accent text-xs font-semibold">
          SE
        </span>
      </div>
    </header>
  );
}

export function PageShell({
  title,
  subtitle,
  children,
  showTopbar = true,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showTopbar?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      {showTopbar && <AppTopbar title={title} />}
      <main className="mx-auto w-full px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </main>
    </div>
  );
}

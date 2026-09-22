import Link from 'next/link';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <Link href="/" className="font-semibold tracking-tight">
            Obengku
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 text-sm text-neutral-500">
          Dibuat untuk dipakai sendiri.
        </div>
      </footer>
    </div>
  );
}

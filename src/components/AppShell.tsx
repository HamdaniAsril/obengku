import Link from 'next/link';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <Link
            href="/"
            className="-mx-2 inline-flex min-h-11 items-center px-2 font-semibold tracking-tight"
          >
            Obengku
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 text-sm text-neutral-600 dark:text-neutral-400">
          © 2026 Obengku | Hamdani Asril
        </div>
      </footer>
    </div>
  );
}

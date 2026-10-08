import Link from 'next/link';
import type { ReactNode } from 'react';
import { LockLine, WrenchLine } from './icons/LineIcons';
import { tools } from '@/tools/registry';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#konten" className="skip-link">
        Lewati ke konten
      </a>

      <header className="site-bar">
        <div className="site-container site-bar__inner">
          <Link href="/" className="brand">
            <span className="brand__mark">
              <WrenchLine className="size-[15px]" />
            </span>
            Obengku
          </Link>
          <p className="site-bar__note">{tools.length} tool · gratis · tanpa akun</p>
        </div>
      </header>

      <main id="konten" className="site-container site-main">
        {children}
      </main>

      <footer className="site-foot">
        <div className="site-container site-foot__inner">
          <p>© 2026 Obengku | Hamdani Asril</p>
          <p className="site-foot__privacy">
            <LockLine className="size-3.5 text-[#16A34A]" />
            Tidak ada data yang dikirim ke server.
          </p>
        </div>
      </footer>
    </div>
  );
}

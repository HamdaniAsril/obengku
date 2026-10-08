import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { AppShell } from '@/components/AppShell';

const body = Inter({ subsets: ['latin'], variable: '--font-face-body', display: 'swap' });

export const metadata: Metadata = {
  title: 'Obengku — Kumpulan Tools Harian',
  description: 'Kumpulan alat bantu kecil untuk pekerjaan sehari-hari.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className={body.variable}>
      <head>
        {/* Sisa data mode gelap lama: hapus kunci tersimpan sekali saat muat. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{localStorage.removeItem("obengku-theme");}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

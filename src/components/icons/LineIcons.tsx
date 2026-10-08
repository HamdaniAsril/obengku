// Ikon garis untuk beranda dan shell. Path diambil dari Lucide (lucide.dev),
// lisensi ISC — Copyright (c) Lucide Contributors.
import type { CSSProperties, ReactNode } from 'react';

type IconProps = { className?: string; style?: CSSProperties };

function Line({ className, style, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const WrenchLine = (p: IconProps) => (
  <Line {...p}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
  </Line>
);

export const ShieldCheckLine = (p: IconProps) => (
  <Line {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Line>
);

export const UserRoundXLine = (p: IconProps) => (
  <Line {...p}>
    <path d="m16.5 16.5 5 5" />
    <path d="M2 21a8 8 0 0 1 11.531-7.18" />
    <path d="m21.5 16.5-5 5" />
    <circle cx="10" cy="8" r="5" />
  </Line>
);

export const BanLine = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M4.929 4.929 19.07 19.071" />
  </Line>
);

export const FolderLine = (p: IconProps) => (
  <Line {...p}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </Line>
);

export const CalculatorLine = (p: IconProps) => (
  <Line {...p}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
  </Line>
);

export const DicesLine = (p: IconProps) => (
  <Line {...p}>
    <rect width="12" height="12" x="2" y="10" rx="2" ry="2" />
    <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6" />
    <path d="M6 18h.01M10 14h.01M15 6h.01M18 9h.01" />
  </Line>
);

export const PlaneLine = (p: IconProps) => (
  <Line {...p}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </Line>
);

export const CakeLine = (p: IconProps) => (
  <Line {...p}>
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <path d="M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01" />
  </Line>
);

export const GaugeLine = (p: IconProps) => (
  <Line {...p}>
    <path d="m12 14 4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </Line>
);

const FILE_OUTLINE =
  'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z';

export const FileSpreadsheetLine = (p: IconProps) => (
  <Line {...p}>
    <path d={FILE_OUTLINE} />
    <path d="M14 2v5a1 1 0 0 0 1 1h5" />
    <path d="M8 13h2M14 13h2M8 17h2M14 17h2" />
  </Line>
);

export const FileTextLine = (p: IconProps) => (
  <Line {...p}>
    <path d={FILE_OUTLINE} />
    <path d="M14 2v5a1 1 0 0 0 1 1h5" />
    <path d="M10 9H8M16 13H8M16 17H8" />
  </Line>
);

export const QrCodeLine = (p: IconProps) => (
  <Line {...p}>
    <rect width="5" height="5" x="3" y="3" rx="1" />
    <rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1" />
  </Line>
);

export const ImageLine = (p: IconProps) => (
  <Line {...p}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </Line>
);

export const CoinsLine = (p: IconProps) => (
  <Line {...p}>
    <path d="M13.744 17.736a6 6 0 1 1-7.48-7.48" />
    <path d="M15 6h1v4" />
    <path d="m6.134 14.768.866-.5 2 3.464" />
    <circle cx="16" cy="8" r="6" />
  </Line>
);

export const ChartPieLine = (p: IconProps) => (
  <Line {...p}>
    <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" />
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
  </Line>
);

export const DivideLine = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="6" r="1" />
    <line x1="5" x2="19" y1="12" y2="12" />
    <circle cx="12" cy="18" r="1" />
  </Line>
);

export const MapLine = (p: IconProps) => (
  <Line {...p}>
    <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
    <path d="M15 5.764v15M9 3.236v15" />
  </Line>
);

export const ChevronRightLine = (p: IconProps) => (
  <Line {...p}>
    <path d="m9 18 6-6-6-6" />
  </Line>
);

export const LockLine = (p: IconProps) => (
  <Line {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Line>
);

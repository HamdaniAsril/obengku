type IconProps = { className?: string };

const INK = '#171A21';

export function CakeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden focusable="false">
      <path
        d="M16 4.2c1.55 1.35 2.3 2.5 2.3 3.5a2.3 2.3 0 1 1-4.6 0c0-1 .75-2.15 2.3-3.5Z"
        fill="#FFC53D"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <rect x="14.7" y="9.6" width="2.6" height="4.6" rx="1.3" fill="#4C8DFF" stroke={INK} strokeWidth="1.7" />
      <path
        d="M6 14.2h20v3.4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-3.4Z"
        fill="#FFF3E2"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <rect x="7.4" y="20.4" width="17.2" height="6.2" rx="2.2" fill="#FF8FA8" stroke={INK} strokeWidth="1.7" />
      <circle cx="12" cy="23.5" r="1.3" fill="#FF5A5F" />
      <circle cx="20" cy="23.5" r="1.3" fill="#FF5A5F" />
      <path d="M5 27.6h22" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function WheelIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden focusable="false">
      <circle cx="16" cy="16" r="11.6" fill="#2B3138" stroke={INK} strokeWidth="1.7" />
      <g stroke="#9AA4B0" strokeWidth="1.6" strokeLinecap="round">
        <path d="M16 5.2v2.4M16 24.4v2.4M5.2 16h2.4M24.4 16h2.4" />
        <path d="m8.4 8.4 1.7 1.7M21.9 21.9l1.7 1.7M23.6 8.4l-1.7 1.7M10.1 21.9l-1.7 1.7" />
      </g>
      <circle cx="16" cy="16" r="7.8" fill="#D8DEE6" stroke={INK} strokeWidth="1.7" />
      <circle cx="16" cy="16" r="3.2" fill="#4C8DFF" stroke={INK} strokeWidth="1.7" />
      <path d="M16 12.8v6.4" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function SheetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden focusable="false">
      <rect x="5" y="5" width="22" height="22" rx="4.5" fill="#FFFFFF" stroke={INK} strokeWidth="1.7" />
      <path
        d="M9 5h14a4 4 0 0 1 4 4v3H5V9a4 4 0 0 1 4-4Z"
        fill="#2FBF71"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <rect x="5.85" y="12.85" width="8" height="3.6" fill="#FFC53D" />
      <g stroke={INK} strokeWidth="1.6" strokeLinecap="round">
        <path d="M5 16.4h22M5 21.9h22" />
        <path d="M14.4 12v15M21 12v15" />
      </g>
      <rect
        x="5"
        y="5"
        width="22"
        height="22"
        rx="4.5"
        stroke={INK}
        strokeWidth="1.7"
        fill="none"
      />
    </svg>
  );
}

export function QrIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden focusable="false">
      <rect x="3.5" y="3.5" width="25" height="25" rx="4.5" fill="#FFFFFF" stroke={INK} strokeWidth="1.7" />
      <g fill={INK}>
        <rect x="8" y="8" width="6" height="6" rx="0.8" />
        <rect x="18" y="8" width="6" height="6" rx="0.8" />
        <rect x="8" y="18" width="6" height="6" rx="0.8" />
      </g>
      <g fill="#4C8DFF">
        <rect x="9.9" y="9.9" width="2.2" height="2.2" rx="0.5" />
        <rect x="19.9" y="9.9" width="2.2" height="2.2" rx="0.5" />
        <rect x="9.9" y="19.9" width="2.2" height="2.2" rx="0.5" />
      </g>
      <g fill={INK}>
        <rect x="18" y="21.8" width="2.6" height="2.2" rx="0.6" />
        <rect x="21.8" y="21.8" width="2.2" height="2.2" rx="0.5" />
        <rect x="21.8" y="16.4" width="2.2" height="2.6" rx="0.5" />
        <rect x="21.8" y="20.4" width="2.2" height="2.6" rx="0.5" />
      </g>
    </svg>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden focusable="false">
      <rect x="4.5" y="6.5" width="23" height="19" rx="4" fill="#FFFFFF" stroke={INK} strokeWidth="1.7" />
      <circle cx="11.5" cy="13" r="2.6" fill="#FFC53D" stroke={INK} strokeWidth="1.7" />
      <path
        d="M6.6 23.2l5-6.1.4 4.1 3.1-3.4 5.3 5.4H6.6Z"
        fill="#F4715B"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PdfIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden focusable="false">
      <path
        d="M9 6.5A3 3 0 0 1 12 3.5h7.4L26 10.1V25.5a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V6.5Z"
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 3.5v4.6a2 2 0 0 0 2 2H26"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12.5 16.5h7" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
      <rect x="12" y="19.5" width="9" height="5.5" rx="1.8" fill="#F4715B" stroke={INK} strokeWidth="1.6" />
    </svg>
  );
}

export function CoinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden focusable="false">
      <circle cx="20.5" cy="11.5" r="7.5" fill="#FFC53D" stroke={INK} strokeWidth="1.6" />
      <circle cx="13.5" cy="19.5" r="9.5" fill="#FFC53D" stroke={INK} strokeWidth="1.7" />
      <circle cx="13.5" cy="19.5" r="5.5" stroke={INK} strokeWidth="1.6" />
    </svg>
  );
}

export function SpinWheelIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden focusable="false">
      <path
        d="M16 17 L16 6 A11 11 0 0 1 26.46 13.60 Z"
        fill="#F4715B"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M16 17 L26.46 13.60 A11 11 0 0 1 22.47 25.90 Z"
        fill="#FFD84D"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M16 17 L22.47 25.90 A11 11 0 0 1 9.53 25.90 Z"
        fill="#A9C3F5"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M16 17 L9.53 25.90 A11 11 0 0 1 5.54 13.60 Z"
        fill="#6ED9A8"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M16 17 L5.54 13.60 A11 11 0 0 1 16 6 Z"
        fill="#C9C2F0"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M16 1.5 L20.5 7 H11.5 Z"
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RatioIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden focusable="false">
      <circle cx="8.5" cy="12" r="3.2" fill="#F4715B" stroke={INK} strokeWidth="1.7" />
      <circle cx="8.5" cy="21.5" r="3.2" fill="#F4715B" stroke={INK} strokeWidth="1.7" />
      <circle cx="23.5" cy="7.75" r="3.2" fill="#A9C3F5" stroke={INK} strokeWidth="1.7" />
      <circle cx="23.5" cy="16.75" r="3.2" fill="#A9C3F5" stroke={INK} strokeWidth="1.7" />
      <circle cx="23.5" cy="25.75" r="3.2" fill="#A9C3F5" stroke={INK} strokeWidth="1.7" />
    </svg>
  );
}

export function MapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden focusable="false">
      <path d="M3 8.5 11 5.5v17.5L3 26V8.5Z" fill="#A9C3F5" stroke={INK} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m11 5.5 10 3.5v17.5L11 23V5.5Z" fill="#FFFFFF" stroke={INK} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m21 9 8-3v17.5l-8 3V9Z" fill="#6ED9A8" stroke={INK} strokeWidth="1.7" strokeLinejoin="round" />
      <path
        d="M16 7.4c2.85 0 5.15 2.3 5.15 5.15 0 3.8-5.15 9.15-5.15 9.15S10.85 16.35 10.85 12.55C10.85 9.7 13.15 7.4 16 7.4Z"
        fill="#F4715B"
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="12.5" r="2" fill="#FFF3E2" stroke={INK} strokeWidth="1.4" />
    </svg>
  );
}

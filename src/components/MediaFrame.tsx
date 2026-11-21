import React, { useState } from 'react';
import type { VisualKey } from '../shared/types';

interface MediaFrameProps {
  imageUrl?: string;
  visualKey?: VisualKey;
  alt: string;
  className?: string;
  aspectClass?: string;
  label?: string;
}

function renderSchematic(visualKey: VisualKey = 'hero-caravan') {
  switch (visualKey) {
    case 'hero-caravan':
    case 'solar-expedition':
      return (
        <svg viewBox="0 0 800 450" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="skyHero" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="58%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
            <linearGradient id="duneA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#92400E" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="duneB" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
            <linearGradient id="bodyAlum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="60%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>
          <rect width="800" height="450" fill="url(#skyHero)" />
          <g opacity="0.16" stroke="#94A3B8" strokeWidth="0.7">
            <line x1="0" y1="90" x2="800" y2="90" />
            <line x1="0" y1="180" x2="800" y2="180" />
            <line x1="200" y1="0" x2="200" y2="450" />
            <line x1="400" y1="0" x2="400" y2="450" />
            <line x1="600" y1="0" x2="600" y2="450" />
          </g>
          <circle cx="635" cy="115" r="44" fill="#F59E0B" opacity="0.18" />
          <circle cx="635" cy="115" r="24" fill="#FBBF24" opacity="0.32" />
          <path d="M0 325 Q220 265 440 315 T800 285 L800 450 L0 450 Z" fill="url(#duneA)" opacity="0.7" />
          <path d="M0 355 Q270 305 560 350 T800 330 L800 450 L0 450 Z" fill="url(#duneB)" />
          {/* Caravan Chassis */}
          <g transform="translate(150, 175)">
            {/* Solar roof array */}
            <rect x="70" y="-10" width="290" height="10" rx="2" fill="#0F172A" stroke="#D97706" strokeWidth="1.5" />
            <line x1="165" y1="-10" x2="165" y2="0" stroke="#475569" strokeWidth="1.2" />
            <line x1="260" y1="-10" x2="260" y2="0" stroke="#475569" strokeWidth="1.2" />
            {/* Main body */}
            <path d="M22 10 L420 10 L452 52 L452 142 L10 142 L10 38 Z" fill="url(#bodyAlum)" stroke="#1E293B" strokeWidth="2.5" />
            {/* Bronze Expedition Accent Stripe */}
            <path d="M12 96 L450 96 L450 116 L12 116 Z" fill="#B45309" />
            {/* Cabin Windows with warm interior light */}
            <rect x="64" y="34" width="110" height="44" rx="5" fill="#F59E0B" opacity="0.88" stroke="#0F172A" strokeWidth="2.5" />
            <rect x="200" y="34" width="90" height="44" rx="5" fill="#FBBF24" opacity="0.75" stroke="#0F172A" strokeWidth="2.5" />
            <rect x="318" y="34" width="46" height="98" rx="4" fill="#334155" stroke="#0F172A" strokeWidth="2" />
            <rect x="328" y="46" width="26" height="28" rx="2" fill="#FDE68A" opacity="0.7" />
            {/* Heavy-duty chassis & twin off-road axles */}
            <rect x="4" y="142" width="465" height="14" rx="3" fill="#0F172A" />
            <circle cx="195" cy="166" r="30" fill="#0F172A" stroke="#475569" strokeWidth="4" />
            <circle cx="195" cy="166" r="14" fill="#94A3B8" />
            <circle cx="270" cy="166" r="30" fill="#0F172A" stroke="#475569" strokeWidth="4" />
            <circle cx="270" cy="166" r="14" fill="#94A3B8" />
            {/* Tow Hitch */}
            <path d="M468 148 L522 156 L522 162 L468 156 Z" fill="#334155" />
          </g>
        </svg>
      );

    case 'aluminum-caravan':
    case 'vip-majlis':
      return (
        <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="bgAlum" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#bgAlum)" />
          <g stroke="#334155" strokeWidth="1" opacity="0.55">
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 32} x2="800" y2={i * 32} />
            ))}
            {Array.from({ length: 25 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 32} y1="0" x2={i * 32} y2="500" />
            ))}
          </g>
          {/* Architectural Blueprint Caravan Elevation */}
          <g transform="translate(120, 120)">
            <rect x="0" y="30" width="520" height="190" rx="8" fill="#E2E8F0" fillOpacity="0.08" stroke="#CBD5E1" strokeWidth="2.5" />
            <line x1="0" y1="150" x2="520" y2="150" stroke="#D97706" strokeWidth="4" />
            <rect x="45" y="65" width="130" height="60" rx="4" fill="#F59E0B" fillOpacity="0.22" stroke="#FBBF24" strokeWidth="1.5" />
            <rect x="205" y="65" width="130" height="60" rx="4" fill="#F59E0B" fillOpacity="0.22" stroke="#FBBF24" strokeWidth="1.5" />
            <rect x="370" y="55" width="68" height="150" rx="3" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="220" cy="242" r="36" fill="#0F172A" stroke="#CBD5E1" strokeWidth="3" />
            <circle cx="220" cy="242" r="15" fill="#D97706" />
            <circle cx="310" cy="242" r="36" fill="#0F172A" stroke="#CBD5E1" strokeWidth="3" />
            <circle cx="310" cy="242" r="15" fill="#D97706" />
            {/* Dimension Callout Lines */}
            <line x1="0" y1="-15" x2="520" y2="-15" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="-22" x2="0" y2="-8" stroke="#94A3B8" strokeWidth="1.5" />
            <line x1="520" y1="-22" x2="520" y2="-8" stroke="#94A3B8" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 'fiberglass-caravan':
      return (
        <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="fgBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <linearGradient id="fgShell" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#fgBg)" />
          <rect x="0" y="370" width="800" height="130" fill="#94A3B8" opacity="0.25" />
          <g transform="translate(135, 130)">
            <path
              d="M40 190 C10 190 5 110 45 55 C85 5 180 0 330 0 L440 0 C485 0 510 45 510 110 L510 190 Z"
              fill="url(#fgShell)"
              stroke="#334155"
              strokeWidth="3"
            />
            <path d="M18 128 L508 128 L508 144 L14 144 Z" fill="#B45309" />
            <rect x="110" y="46" width="150" height="58" rx="14" fill="#1E293B" />
            <rect x="295" y="46" width="90" height="58" rx="14" fill="#1E293B" />
            <rect x="412" y="48" width="54" height="132" rx="8" fill="#E2E8F0" stroke="#334155" strokeWidth="2" />
            <circle cx="265" cy="205" r="38" fill="#0F172A" stroke="#64748B" strokeWidth="4" />
            <circle cx="265" cy="205" r="16" fill="#CBD5E1" />
          </g>
        </svg>
      );

    case 'pickup-canopy':
    case 'factory-cnc':
      return (
        <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="800" height="500" fill="#181E29" />
          <g stroke="#334155" strokeWidth="0.9" opacity="0.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={`g1-${i}`} x1="0" y1={i * 38} x2="800" y2={i * 38} />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`g2-${i}`} x1={i * 42} y1="0" x2={i * 42} y2="500" />
            ))}
          </g>
          <g transform="translate(130, 125)">
            {/* Gullwing Pickup Canopy */}
            <rect x="15" y="30" width="285" height="135" rx="6" fill="#CBD5E1" stroke="#0F172A" strokeWidth="3" />
            <polygon points="32,46 270,46 250,18 50,18" fill="#B45309" opacity="0.9" />
            <rect x="42" y="54" width="228" height="92" rx="4" fill="#1E293B" stroke="#94A3B8" strokeWidth="2" />
            {/* Truck Cab Silhouette */}
            <path d="M300 45 L405 45 L455 95 L515 108 L515 165 L300 165 Z" fill="#E2E8F0" stroke="#0F172A" strokeWidth="3" />
            <polygon points="318,60 396,60 434,98 318,98" fill="#334155" />
            <rect x="10" y="165" width="510" height="24" rx="4" fill="#0F172A" />
            <circle cx="140" cy="200" r="42" fill="#0F172A" stroke="#64748B" strokeWidth="5" />
            <circle cx="140" cy="200" r="19" fill="#D97706" />
            <circle cx="425" cy="200" r="42" fill="#0F172A" stroke="#64748B" strokeWidth="5" />
            <circle cx="425" cy="200" r="19" fill="#D97706" />
          </g>
        </svg>
      );

    case 'water-fuel-tank':
      return (
        <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="800" height="500" fill="#0F172A" />
          <g stroke="#1E293B" strokeWidth="1.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`t-${i}`} x1="0" y1={i * 44} x2="800" y2={i * 44} />
            ))}
          </g>
          <g transform="translate(150, 120)">
            {/* Primary Baffled Tank */}
            <rect x="20" y="40" width="460" height="190" rx="14" fill="#CBD5E1" stroke="#475569" strokeWidth="3" />
            {/* Internal Baffle Weld Seams */}
            <line x1="135" y1="40" x2="135" y2="230" stroke="#475569" strokeWidth="2.5" strokeDasharray="8 6" />
            <line x1="250" y1="40" x2="250" y2="230" stroke="#475569" strokeWidth="2.5" strokeDasharray="8 6" />
            <line x1="365" y1="40" x2="365" y2="230" stroke="#475569" strokeWidth="2.5" strokeDasharray="8 6" />
            {/* Industrial Valves & Filler Neck */}
            <rect x="65" y="14" width="44" height="26" rx="3" fill="#B45309" />
            <rect x="390" y="14" width="44" height="26" rx="3" fill="#0284C7" />
            <rect x="480" y="175" width="32" height="24" rx="2" fill="#D97706" />
            <rect x="45" y="230" width="410" height="18" rx="3" fill="#334155" />
          </g>
        </svg>
      );

    case 'tent-structure':
    case 'katara-pavilion':
    default:
      return (
        <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="kataraSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#kataraSky)" />
          <rect x="0" y="375" width="800" height="125" fill="#1E293B" />
          {/* Exhibition Arch Pavilion */}
          <g transform="translate(95, 110)">
            <path d="M20 265 L20 110 Q160 15 305 110 Q450 15 590 110 L590 265" fill="none" stroke="#D97706" strokeWidth="5" />
            <path d="M55 265 L55 128 Q160 55 270 128 L270 265 Z" fill="#F59E0B" fillOpacity="0.16" stroke="#FBBF24" strokeWidth="2" />
            <path d="M340 265 L340 128 Q450 55 555 128 L555 265 Z" fill="#F59E0B" fillOpacity="0.16" stroke="#FBBF24" strokeWidth="2" />
            {/* Silhouette Caravan inside Pavilion */}
            <rect x="130" y="175" width="350" height="82" rx="6" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2.5" />
            <rect x="130" y="220" width="350" height="12" fill="#B45309" />
            <rect x="165" y="190" width="80" height="24" rx="3" fill="#F59E0B" opacity="0.85" />
            <rect x="275" y="190" width="80" height="24" rx="3" fill="#F59E0B" opacity="0.85" />
          </g>
        </svg>
      );
  }
}

export function MediaFrame({
  imageUrl,
  visualKey = 'hero-caravan',
  alt,
  className = '',
  aspectClass = 'aspect-[16/10]',
  label,
}: MediaFrameProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showRealImage = Boolean(imageUrl && imageUrl.trim().length > 0 && !imgFailed);

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${aspectClass} ${className}`}>
      {showRealImage ? (
        <img
          src={imageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        renderSchematic(visualKey)
      )}
      {label ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent p-4">
          <span className="text-xs font-medium text-slate-100">{label}</span>
        </div>
      ) : null}
    </div>
  );
}

interface PhotoMatteFrameProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
  zoomOnHover?: boolean;
  className?: string;
}

export function PhotoMatteFrame({
  children,
  variant = 'light',
  zoomOnHover = true,
  className = '',
}: PhotoMatteFrameProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={`relative rounded-[3px] border p-1.5 transition-colors duration-300 ${
        isDark
          ? 'border-zinc-800 bg-[#141418] group-hover:border-[#B5945B]/55 group-hover:bg-[#18181D]'
          : 'border-zinc-200/90 bg-zinc-50 group-hover:border-[#B5945B]/45 group-hover:bg-[#FAF8F4]'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 start-0 h-2.5 w-2.5 border-t-2 border-s-2 transition-colors duration-300 ${
          isDark
            ? 'border-[#B5945B]/40 group-hover:border-[#EAD4A5]'
            : 'border-[#B5945B]/0 group-hover:border-[#B5945B]'
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 end-0 h-2.5 w-2.5 border-b-2 border-e-2 transition-colors duration-300 ${
          isDark
            ? 'border-[#B5945B]/40 group-hover:border-[#EAD4A5]'
            : 'border-[#B5945B]/0 group-hover:border-[#B5945B]'
        }`}
      />
      <div
        className={`overflow-hidden rounded-[2px] border ${
          isDark ? 'border-zinc-800 bg-black' : 'border-zinc-200/70 bg-zinc-100'
        }`}
      >
        <div className={zoomOnHover ? 'transition-transform duration-500 ease-out group-hover:scale-[1.03]' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
}

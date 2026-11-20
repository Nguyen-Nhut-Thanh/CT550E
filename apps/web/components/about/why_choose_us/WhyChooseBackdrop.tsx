import type { CSSProperties } from "react";

// Deterministic positions avoid hydration differences between server and client.
const stars = Array.from({ length: 142 }, (_, index) => {
  const random = (seed: number) => {
    const value = Math.sin((index + 1) * seed) * 43758.5453;
    return value - Math.floor(value);
  };
  const clustered = index >= 90;
  return {
    left: `${clustered ? 63 + (random(12.9898) + random(39.346) - 1) * 14 : random(12.9898) * 100}%`,
    top: `${clustered ? 41 + (random(78.233) + random(11.135) - 1) * 14 : random(78.233) * 100}%`,
    size: 0.9 + random(45.164) * 2.2,
    gold: random(94.673) > (clustered ? 0.55 : 0.78),
    duration: `${2 + random(63.726) * 3}s`,
    delay: `${-random(16.132) * 4}s`,
  };
});

export default function WhyChooseBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg className="absolute right-0 top-0 h-full w-full min-w-[1100px] mix-blend-screen opacity-[0.96]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="why-aurora-core-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="5" result="blurCore" />
                    <feGaussianBlur stdDeviation="16" result="blurMid" />
                    <feMerge>
                        <feMergeNode in="blurMid" />
                        <feMergeNode in="blurCore" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="why-aurora-wide-bloom" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="34" />
                </filter>
                <filter id="why-aurora-soft-sheet" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="20" />
                </filter>
                <filter id="why-ray-feather" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="14" />
                </filter>
                <linearGradient id="why-ribbon-main-grad" x1="18%" y1="5%" x2="98%" y2="42%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
                    <stop offset="22%" stopColor="#2dd4bf" stopOpacity="0.55" />
                    <stop offset="46%" stopColor="#5eead4" stopOpacity="0.98" />
                    <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.85" />
                    <stop offset="82%" stopColor="#818cf8" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="why-ribbon-hot-core" x1="25%" y1="8%" x2="88%" y2="38%">
                    <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0" />
                    <stop offset="30%" stopColor="#99f6e4" stopOpacity="0.85" />
                    <stop offset="52%" stopColor="#ecfeff" stopOpacity="1" />
                    <stop offset="72%" stopColor="#7dd3fc" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="why-ribbon-secondary-grad" x1="45%" y1="25%" x2="100%" y2="55%">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0" />
                    <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.48" />
                    <stop offset="68%" stopColor="#8b5cf6" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="why-orbital-halo-1" cx="50%" cy="50%" r="50%">
                    <stop offset="55%" stopColor="#0284c7" stopOpacity="0" />
                    <stop offset="88%" stopColor="#38bdf8" stopOpacity="0.16" />
                    <stop offset="97%" stopColor="#7dd3fc" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="why-orbital-halo-2" cx="50%" cy="50%" r="50%">
                    <stop offset="60%" stopColor="#0d9488" stopOpacity="0" />
                    <stop offset="92%" stopColor="#2dd4bf" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="why-god-ray-bright" x1="78%" y1="0%" x2="45%" y2="75%">
                    <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.42" />
                    <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.22" />
                    <stop offset="72%" stopColor="#0284c7" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="why-god-ray-soft" x1="85%" y1="0%" x2="52%" y2="82%">
                    <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.28" />
                    <stop offset="45%" stopColor="#7dd3fc" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
            </defs>
            <g className="origin-[70%_20%] motion-safe:animate-why-aurora-drift">
                <ellipse cx="860" cy="40" rx="340" ry="230" fill="url(#why-orbital-halo-1)" />
                <ellipse cx="820" cy="560" rx="460" ry="260" fill="url(#why-orbital-halo-2)" opacity="0.7" />
                <path d="M 380 -10 C 560 140, 790 250, 1140 210 C 1280 195, 1390 230, 1480 280"
                      fill="none" stroke="#7dd3fc" strokeWidth="2.5" strokeOpacity="0.28" filter="url(#why-aurora-core-glow)" />
            </g>
            <g className="origin-[70%_20%] motion-safe:animate-why-aurora-drift" filter="url(#why-aurora-wide-bloom)">
                <path d="M 240 -20 C 480 150, 740 290, 1080 250 C 1260 230, 1370 295, 1480 390"
                      fill="none" stroke="url(#why-ribbon-main-grad)" strokeWidth="85" strokeLinecap="round" />
                <path d="M 650 220 C 890 310, 1120 200, 1460 320"
                      fill="none" stroke="url(#why-ribbon-secondary-grad)" strokeWidth="65" strokeLinecap="round" />
            </g>
            <g className="origin-[70%_20%] motion-safe:animate-why-aurora-drift" filter="url(#why-aurora-soft-sheet)">
                <path d="M 280 -15 C 510 155, 760 285, 1090 245 C 1255 225, 1365 280, 1475 375
                         C 1360 315, 1245 270, 1080 285 C 745 320, 495 190, 260 15 Z"
                      fill="url(#why-ribbon-main-grad)" opacity="0.85" />
                <path d="M 790 235 C 980 295, 1180 185, 1470 275
                         C 1200 225, 995 335, 780 265 Z"
                      fill="url(#why-ribbon-secondary-grad)" opacity="0.8" />
            </g>
            <g className="origin-[70%_20%] motion-safe:animate-why-aurora-drift" filter="url(#why-aurora-core-glow)">
                <path d="M 330 15 C 540 165, 775 275, 1085 242 C 1245 225, 1355 275, 1465 360"
                      fill="none" stroke="url(#why-ribbon-main-grad)" strokeWidth="14" strokeLinecap="round" />
                <path d="M 450 92 C 630 205, 815 268, 1055 244 C 1175 232, 1275 252, 1365 298"
                      fill="none" stroke="url(#why-ribbon-hot-core)" strokeWidth="4.5" strokeLinecap="round" />
            </g>
            <g className="origin-[78%_0%] motion-safe:animate-why-aurora-rays" filter="url(#why-ray-feather)">
                <polygon points="1130,-20 1235,-20 910,640 735,640" fill="url(#why-god-ray-bright)" />
                <polygon points="1165,-20 1198,-20 865,610 810,610" fill="url(#why-god-ray-soft)" opacity="0.9" />
                <polygon points="1040,-20 1105,-20 745,590 645,590" fill="url(#why-god-ray-soft)" opacity="0.75" />
                <polygon points="1255,-20 1335,-20 1055,620 945,620" fill="url(#why-god-ray-soft)" opacity="0.65" />
                <polygon points="980,-20 1380,-20 1120,680 610,680" fill="url(#why-god-ray-soft)" opacity="0.45" />
            </g>
        </svg>

      <div className="absolute -bottom-[15%] left-1/2 h-[35vh] w-[90vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(22,54,102,0.22)_0%,transparent_70%)] blur-[60px]" />
      {stars.map((star, index) => (
        <span key={index}
          className={`absolute left-[var(--star-x)] top-[var(--star-y)] size-[var(--star-size)] rounded-full opacity-70 motion-safe:animate-why-star [animation-delay:var(--star-delay)] ${star.gold ? "bg-yellow-200 shadow-[0_0_7px_rgba(253,224,71,0.9)]" : "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"}`}
          style={{ "--star-x": star.left, "--star-y": star.top, "--star-size": `${star.size}px`, "--star-duration": star.duration, "--star-delay": star.delay } as CSSProperties}
        />
      ))}
    </div>
  );
}

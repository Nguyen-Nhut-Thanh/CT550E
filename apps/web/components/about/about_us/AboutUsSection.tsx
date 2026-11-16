"use client";

import { useRef, useState, type MouseEvent } from "react";
import { TopWaveDivider, BottomWaveDivider } from "@/components/common/dividers";
import { AboutUsContent } from "./AboutUsContent";
import { AboutUsPhotoCollage } from "./AboutUsPhotoCollage";

function SkyTravelBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <path
            id="about-flight-arc"
            d="M-60 130C180 40 420 190 650 95S960 110 1140 55s250 20 370-15"
          />
          <path
            id="about-flight-loop"
            d="M410 855C530 780 640 870 740 815s20-75-15-50-20 80 100 45 295 35 465-25"
          />
          <path
            id="about-kite-left"
            d="M35 760C90 660 40 530 115 430s-80-175-20-260"
          />
          <path
            id="about-kite-right"
            d="M1375 680C1320 560 1410 440 1345 320s40-180-15-255"
          />
          <filter
            id="about-sky-glow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <use
          href="#about-flight-arc"
          className="about-dash"
          stroke="rgba(125,211,252,.28)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
        />
        <use
          href="#about-flight-loop"
          className="about-dash"
          stroke="rgba(56,189,248,.3)"
          strokeWidth="1.5"
          strokeDasharray="5 7"
        />
        <use
          href="#about-kite-left"
          className="about-dash"
          stroke="rgba(186,230,253,.2)"
          strokeWidth="1.3"
          strokeDasharray="4 7"
        />
        <use
          href="#about-kite-right"
          className="about-dash"
          stroke="rgba(165,243,252,.2)"
          strokeWidth="1.3"
          strokeDasharray="4 7"
        />
        <path
          d="M470 55q45-22 86 3t87-5M1210 445c43-20 71 5 52 26s-37-8-14-21 52-2 86-15"
          stroke="rgba(224,242,254,.2)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <g
          transform="translate(710 62)"
          opacity=".42"
          className="about-float-slow"
        >
          <path
            d="M18 0C6 0 0 9 0 18s10 16 13 21h10c3-5 13-12 13-21S30 0 18 0Z"
            fill="rgba(56,189,248,.12)"
            stroke="#7dd3fc"
            strokeWidth="1.4"
          />
          <path d="M18 0c-6 8-6 28-3 39M18 0c6 8 6 28 3 39" stroke="#bae6fd" />
          <rect
            x="13.5"
            y="42"
            width="9"
            height="6"
            rx="1.5"
            fill="rgba(14,165,233,.2)"
            stroke="#7dd3fc"
          />
        </g>
        <g transform="translate(1330 250)" opacity=".28">
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="#7dd3fc"
            strokeDasharray="3 3"
          />
          <path
            d="m16 5 4 11-4 11-4-11 4-11Z"
            fill="rgba(56,189,248,.15)"
            stroke="#bae6fd"
          />
        </g>
        <g filter="url(#about-sky-glow)">
          <g transform="translate(-18 -12)">
            <path d="m0 4 34 9-23 9 3-8L0 4Z" fill="#fff" />
            <path d="m34 13-20 1 2 9 18-10Z" fill="#bae6fd" />
          </g>
          <animateMotion dur="22s" repeatCount="indefinite" rotate="auto">
            <mpath href="#about-flight-arc" />
          </animateMotion>
        </g>
        <g filter="url(#about-sky-glow)">
          <g transform="translate(-16 -11)">
            <path d="m0 3 30 8-20 8 2-7L0 3Z" fill="#f0f9ff" />
            <path d="m30 11-18 1 2 8 16-9Z" fill="#7dd3fc" />
          </g>
          <animateMotion dur="18s" repeatCount="indefinite" rotate="auto">
            <mpath href="#about-flight-loop" />
          </animateMotion>
        </g>
        <g filter="url(#about-sky-glow)">
          <g transform="translate(-14 -16) rotate(30)">
            <path
              d="m14 0 12 14-12 18L2 14 14 0Z"
              fill="rgba(56,189,248,.3)"
              stroke="#7dd3fc"
              strokeWidth="1.5"
            />
            <path d="M14 32q-8 10 2 19t-4 18" stroke="#bae6fd" />
            <path d="m9 44 6 2-6 2 6-2Z" fill="#fde047" />
          </g>
          <animateMotion
            dur="17s"
            repeatCount="indefinite"
            keyPoints="0;1;0"
            keyTimes="0;.5;1"
            calcMode="spline"
            keySplines=".42 0 .58 1;.42 0 .58 1"
          >
            <mpath href="#about-kite-left" />
          </animateMotion>
        </g>
        <g filter="url(#about-sky-glow)">
          <g transform="translate(-14 -16) rotate(-28)">
            <path
              d="m14 0 12 14-12 18L2 14 14 0Z"
              fill="rgba(250,204,21,.22)"
              stroke="#fde047"
              strokeWidth="1.5"
            />
            <path d="M14 32q8 10-2 19t4 18" stroke="#fde047" />
            <path d="m11 45 6 2-6 2 6-2Z" fill="#7dd3fc" />
          </g>
          <animateMotion
            dur="19s"
            repeatCount="indefinite"
            keyPoints="0;1;0"
            keyTimes="0;.5;1"
            calcMode="spline"
            keySplines=".42 0 .58 1;.42 0 .58 1"
          >
            <mpath href="#about-kite-right" />
          </animateMotion>
        </g>
      </svg>
    </div>
  );
}

export default function AboutUsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const handleSectionMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePos({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleSectionMouseMove}
      className="about-section relative isolate flex items-center overflow-hidden px-4 pt-16 pb-16 text-white sm:px-8 sm:pt-20 sm:pb-20 lg:px-14 lg:pt-24 lg:pb-24"
      style={{
        background:
          "radial-gradient(circle at 75% 30%, #103272 0%, #0a1d47 45%, #050e24 100%)",
      }}
    >
      <TopWaveDivider fillColor="#dce8fb"/>
      <SkyTravelBackdrop />

      <div
        className="pointer-events-none absolute inset-0 z-[2] transition-opacity duration-500"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, rgba(56,189,248,.12), transparent 70%)`,
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full opacity-[.07]"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="#7dd3fc" strokeWidth="1.2">
          <path d="M-100 150c250-70 420 110 660 30S980 40 1280 90s270 150 320 110M-120 260c300-90 470 110 730 20s410-210 710-90 210 110 300 100M-80 430c290-100 470 100 740 0s420-190 700-70M-40 630c320-100 540 80 850-30s450-170 670-60" />
          <ellipse
            cx="1150"
            cy="220"
            rx="220"
            ry="120"
            transform="rotate(-15 1150 220)"
          />
          <ellipse
            cx="1150"
            cy="220"
            rx="150"
            ry="75"
            transform="rotate(-15 1150 220)"
          />
          <ellipse
            cx="260"
            cy="620"
            rx="260"
            ry="130"
            transform="rotate(12 260 620)"
          />
        </g>
      </svg>

      <div className="about-orb pointer-events-none absolute left-[8%] top-16 z-[2] h-36 w-36 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="about-orb about-orb-delayed pointer-events-none absolute bottom-12 left-[40%] z-[2] h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="about-orb about-orb-late pointer-events-none absolute right-[8%] top-1/3 z-[2] h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <AboutUsContent
          activeFeature={activeFeature}
          onFeatureChange={setActiveFeature}
        />

        <div className="lg:col-span-6">
          <AboutUsPhotoCollage activeFeature={activeFeature} />
        </div>
      </div>

      <BottomWaveDivider fillColor="#f7fcff" />
    </section>
  );
}

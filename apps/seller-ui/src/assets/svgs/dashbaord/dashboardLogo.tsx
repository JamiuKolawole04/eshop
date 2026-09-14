import * as React from "react";

export const DashbaordLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={400}
    height={400}
    viewBox="0 0 1024 1024"
    fill="none"
    {...props}
  >
    <defs>
      <linearGradient id="logo-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#151519" />
        <stop offset="1" stopColor="#0D0D10" />
      </linearGradient>

      <linearGradient id="logo-edge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3D3E45" />
        <stop offset="0.5" stopColor="#22232A" />
        <stop offset="1" stopColor="#303139" />
      </linearGradient>

      <radialGradient id="logo-dot" cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#F0F0F2" />
        <stop offset="0.7" stopColor="#D7D8DC" />
        <stop offset="1" stopColor="#BFC0C5" />
      </radialGradient>

      <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
    </defs>

    {/* Outer shadow */}
    <rect
      x={55}
      y={55}
      width={914}
      height={914}
      rx={145}
      fill="black"
      opacity={0.55}
      filter="url(#logo-shadow)"
    />

    {/* Outer rounded frame */}
    <rect
      x={64}
      y={64}
      width={896}
      height={896}
      rx={142}
      fill="url(#logo-edge)"
    />

    {/* Inner dark face */}
    <rect
      x={79}
      y={79}
      width={866}
      height={866}
      rx={128}
      fill="url(#logo-bg)"
    />

    {/* Subtle inner highlight */}
    <rect
      x={80}
      y={80}
      width={864}
      height={864}
      rx={127}
      fill="none"
      stroke="#24252B"
      strokeWidth={2}
      opacity={0.8}
    />

    {/* 3 × 3 dots */}
    <g fill="url(#logo-dot)">
      <circle cx={390} cy={390} r={27} />
      <circle cx={512} cy={390} r={27} />
      <circle cx={634} cy={390} r={27} />

      <circle cx={390} cy={512} r={27} />
      <circle cx={512} cy={512} r={27} />
      <circle cx={634} cy={512} r={27} />

      <circle cx={390} cy={634} r={27} />
      <circle cx={512} cy={634} r={27} />
      <circle cx={634} cy={634} r={27} />
    </g>
  </svg>
);

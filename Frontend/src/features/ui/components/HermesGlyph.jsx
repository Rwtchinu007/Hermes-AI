import { useId } from "react";

/*
  Vector Hermes mark: two angled pillars joined by a flowing swoosh
  (a clean redraw of the favicon "H", with no background box).
*/
const HermesGlyph = ({ size = 34, className = "" }) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={`hg-${id}`} x1="10" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffc076" />
          <stop offset="0.55" stopColor="#f2994a" />
          <stop offset="1" stopColor="#d9703f" />
        </linearGradient>
      </defs>
      {/* Left pillar: angled top and bottom */}
      <path
        d="M12 8.5 18.5 12.4V35.6L12 39.5Z"
        fill={`url(#hg-${id})`}
        stroke={`url(#hg-${id})`}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Right pillar: mirrored */}
      <path
        d="M36 8.5 29.5 12.4V35.6L36 39.5Z"
        fill={`url(#hg-${id})`}
        stroke={`url(#hg-${id})`}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Flowing crossbar swoosh */}
      <path
        d="M5.5 15C9.8 23.6 17 26 24.3 26.6c6.6.6 12 3.3 17.7 10.4-6.8-4.2-12-5.4-18.3-6C15.9 30.3 8.8 26.4 5.5 15Z"
        fill={`url(#hg-${id})`}
      />
    </svg>
  );
};

export default HermesGlyph;

interface StampProps {
  className?: string;
}

/**
 * Carimbo circular giratório "feito à mão ✦ no Rio de Janeiro" —
 * selo de autenticidade da marca, gira devagar como um vinil.
 */
export function Stamp({ className }: StampProps) {
  return (
    <div aria-hidden className={className}>
      <svg
        viewBox="0 0 120 120"
        className="animate-spin-slow h-full w-full"
        role="presentation"
      >
        <defs>
          <path
            id="stamp-circle"
            d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"
          />
        </defs>
        <text
          fill="currentColor"
          fontSize="10"
          letterSpacing="2.8"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          <textPath href="#stamp-circle">
            FEITO À MÃO ✦ NO RIO DE JANEIRO ✦
          </textPath>
        </text>
        {/* Sol no centro */}
        <circle cx="60" cy="60" r="13" fill="currentColor" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="60"
            y1="38"
            x2="60"
            y2="44"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${deg} 60 60)`}
          />
        ))}
      </svg>
    </div>
  );
}

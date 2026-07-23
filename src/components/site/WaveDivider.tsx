interface WaveDividerProps {
  /** id único por instância (o SVG usa <pattern>) */
  id: string;
  /** cor das ondas via currentColor — passe text-* no className */
  className?: string;
  /** altura em px */
  height?: number;
}

/**
 * A onda do calçadão de Copacabana — assinatura visual da Gabi Bijus.
 * Usada como divisor entre seções, sempre em um tom da paleta.
 */
export function WaveDivider({ id, className, height = 46 }: WaveDividerProps) {
  return (
    <div aria-hidden className={className}>
      <svg width="100%" height={height} role="presentation">
        <defs>
          <pattern
            id={id}
            width="120"
            height={height}
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 10 Q 15 -2 30 10 T 60 10 T 90 10 T 120 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            <path
              d="M0 23 Q 15 11 30 23 T 60 23 T 90 23 T 120 23"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              opacity="0.55"
            />
            <path
              d="M0 36 Q 15 24 30 36 T 60 36 T 90 36 T 120 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              opacity="0.25"
            />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

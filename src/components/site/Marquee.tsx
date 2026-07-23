interface MarqueeProps {
  words: string[];
}

/**
 * Faixa de palavras da marca — em Fraunces itálico minúsculo,
 * ritmo lento, como uma legenda de editorial.
 */
export function Marquee({ words }: MarqueeProps) {
  // Duas metades idênticas: a animação desloca -50% e o loop fica contínuo.
  const half = Array.from({ length: 4 }, () => words).flat();

  return (
    <div
      aria-hidden
      className="overflow-hidden border-y border-gold/50 bg-bg py-4"
    >
      <div className="animate-marquee flex w-max">
        {[0, 1].map((i) => (
          <div key={i} className="flex shrink-0 items-center">
            {half.map((word, j) => (
              <span
                key={j}
                className="flex items-center whitespace-nowrap font-display text-xl italic lowercase tracking-wide text-earth md:text-2xl"
              >
                <span className="px-5">{word}</span>
                <span className="not-italic text-gold">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

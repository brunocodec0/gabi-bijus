"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = images[active];

  return (
    <div>
      <button
        type="button"
        onClick={() => setZoomed((z) => !z)}
        aria-label={zoomed ? "Reduzir foto" : "Ampliar foto"}
        className="relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-3xl bg-bg"
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority
          quality={90}
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectPosition: `${current.focalX}% ${current.focalY}%` }}
          className={`object-cover transition-transform duration-500 ease-out ${
            zoomed ? "scale-150 cursor-zoom-out" : ""
          }`}
        />
      </button>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => {
                setActive(i);
                setZoomed(false);
              }}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-[4/5] w-16 overflow-hidden rounded-xl transition-all md:w-20 ${
                i === active
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-bg-light"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="80px"
                style={{ objectPosition: `${img.focalX}% ${img.focalY}%` }}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

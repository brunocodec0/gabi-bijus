"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const options = [
  { value: "novidades", label: "Novidades" },
  { value: "preco-asc", label: "Menor preço" },
  { value: "preco-desc", label: "Maior preço" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("ordem") ?? "novidades";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "novidades") params.delete("ordem");
    else params.set("ordem", value);
    router.push(`${pathname}${params.size ? `?${params}` : ""}`, {
      scroll: false,
    });
  };

  return (
    <label className="flex items-center gap-2 text-sm text-text/60">
      <span className="label-caps">Ordenar</span>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-full border border-text/15 bg-bg-light px-3.5 py-2 font-medium text-text outline-none transition-colors focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

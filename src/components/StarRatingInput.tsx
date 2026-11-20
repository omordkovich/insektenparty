"use client";

import { useTranslations } from "next-intl";

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label: string;
};

// 1-5 stars as a native radio group: arrow keys, focus and screen readers
// work like any radio group; the stars are just the visible labels.
export function StarRatingInput({ value, onChange, disabled = false, label }: StarRatingInputProps) {
  const t = useTranslations("feedback");
  return (
    <fieldset className="text-left" disabled={disabled}>
      <legend className="mb-2 block text-sm font-bold">{label}</legend>
      <div className="flex gap-1" role="presentation">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
              aria-label={t("starLabel", { n })}
            />
            <span
              aria-hidden="true"
              className={`block rounded-lg px-1 text-4xl leading-none transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-leaf ${
                n <= value ? "text-amber-500" : "text-zinc-300"
              }`}
            >
              ★
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

"use client";

import { useRef } from "react";

const ASSIST_LETTERS = ["ټ", "ډ", "ړ", "ږ", "ښ", "ڼ", "ې", "ۍ", "ځ", "څ", "ګ"];

export default function PashtoInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const insert = (letter: string) => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? start;
    onChange(value.slice(0, start) + letter + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + 1, start + 1);
    });
  };

  return (
    <div>
      <input
        ref={ref}
        dir="rtl"
        lang="ps"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-mist bg-white/80 px-4 py-3 text-center font-naskh text-xl outline-none transition-colors focus:border-azure"
      />
      <div dir="rtl" className="mt-2 flex flex-wrap justify-center gap-1.5">
        {ASSIST_LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            onClick={() => insert(letter)}
            className="grid size-9 place-items-center rounded-xl border border-mist bg-ice font-naskh text-lg font-bold text-azure-deep transition-colors hover:border-azure"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

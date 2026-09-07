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
      <div dir="rtl" className="mt-2 grid grid-cols-6 gap-1.5">
        {ASSIST_LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            lang="ps"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insert(letter)}
            className="grid h-10 select-none place-items-center rounded-xl border border-mist bg-white/70 font-naskh text-xl font-bold text-azure-deep transition-colors [touch-action:manipulation] hover:border-azure active:bg-mist"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

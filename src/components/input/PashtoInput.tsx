"use client";

import { useRef } from "react";

// Full Pashto alphabet, alphabetical, laid out in keyboard rows (RTL).
const KEY_ROWS = [
  ["ا", "آ", "ب", "پ", "ت", "ټ", "ث", "ج", "ځ", "چ", "څ"],
  ["ح", "خ", "د", "ډ", "ذ", "ر", "ړ", "ز", "ژ", "ږ", "س"],
  ["ش", "ښ", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک"],
  ["ګ", "ل", "م", "ن", "ڼ", "ه", "و", "ی", "ې", "ي", "ۍ"],
];
const LAST_LETTER = "ئ";

const KEY_CLASS =
  "grid h-9 select-none place-items-center rounded-lg border border-mist bg-white/70 font-naskh text-lg font-bold text-azure-deep transition-colors [touch-action:manipulation] hover:border-azure active:bg-mist";

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

  const setCaret = (pos: number) => {
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(pos, pos);
    });
  };

  // Work off the live DOM value and write it back immediately, so taps
  // faster than a React render still stack instead of overwriting.
  const insert = (letter: string) => {
    const el = ref.current;
    if (!el) {
      onChange(value + letter);
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    el.value = el.value.slice(0, start) + letter + el.value.slice(end);
    el.setSelectionRange(start + letter.length, start + letter.length);
    onChange(el.value);
    setCaret(start + letter.length);
  };

  const backspace = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    if (end === 0) return;
    const from = start === end ? start - 1 : start;
    el.value = el.value.slice(0, from) + el.value.slice(end);
    el.setSelectionRange(from, from);
    onChange(el.value);
    setCaret(from);
  };

  const key = (letter: string) => (
    <button
      key={letter}
      type="button"
      lang="ps"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => insert(letter)}
      className={KEY_CLASS}
    >
      {letter}
    </button>
  );

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
      <div dir="rtl" className="mt-2 space-y-1">
        {KEY_ROWS.map((row) => (
          <div key={row[0]} className="grid grid-cols-11 gap-1">
            {row.map(key)}
          </div>
        ))}
        <div className="grid grid-cols-11 gap-1">
          {key(LAST_LETTER)}
          <button
            type="button"
            aria-label="Space"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insert(" ")}
            className="col-span-8 h-9 select-none rounded-lg border border-mist bg-white/70 transition-colors [touch-action:manipulation] hover:border-azure active:bg-mist"
          />
          <button
            type="button"
            aria-label="Backspace"
            onMouseDown={(e) => e.preventDefault()}
            onClick={backspace}
            className="col-span-2 grid h-9 select-none place-items-center rounded-lg border border-mist bg-mist/50 text-sm font-bold text-ink-soft transition-colors [touch-action:manipulation] hover:border-azure active:bg-mist"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}

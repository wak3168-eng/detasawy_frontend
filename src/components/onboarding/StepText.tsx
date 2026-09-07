"use client";

import { useState } from "react";

export default function StepText({
  placeholder,
  onSubmit,
  onSkip,
  skipLabel,
}: {
  placeholder: string;
  onSubmit: (value: string) => void;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-3">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && value.trim() && onSubmit(value.trim())}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-mist bg-white/70 px-5 py-4 text-sm outline-none transition-colors focus:border-azure"
      />
      <button
        onClick={() => value.trim() && onSubmit(value.trim())}
        disabled={!value.trim()}
        className="w-full rounded-full bg-azure py-3.5 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-40"
      >
        Continue
      </button>
      {onSkip && skipLabel && (
        <button onClick={onSkip} className="w-full py-2 text-sm font-bold text-ink-soft">
          {skipLabel}
        </button>
      )}
    </div>
  );
}

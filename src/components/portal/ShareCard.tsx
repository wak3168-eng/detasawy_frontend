"use client";

import { useState } from "react";

const SITE = "https://detasawy.com";
const MESSAGE = `Help build the Pashto of tomorrow — one word at a time. ${SITE}`;

export default function ShareCard() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-3xl border border-mist bg-white/70 p-5">
      <h2 className="font-extrabold">Bring your district aboard</h2>
      <p className="mt-1.5 text-sm text-ink-soft">
        Every person you invite scores for your district too.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(MESSAGE)}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-azure px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
        >
          Share on WhatsApp
        </a>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(SITE);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              // clipboard unavailable — the WhatsApp button still works
            }
          }}
          className="rounded-full border border-sky px-5 py-2.5 text-sm font-bold text-azure-deep transition-colors hover:bg-mist"
        >
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

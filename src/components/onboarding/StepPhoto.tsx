"use client";

import { useState } from "react";

function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no canvas"));
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function StepPhoto({
  onSubmit,
  onSkip,
}: {
  onSubmit: (dataUrl: string) => void;
  onSkip: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <label className="grid cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-sky bg-white/50 py-10 transition-colors hover:border-azure">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Profile preview"
            className="size-32 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-azure-deep">
            Tap to choose a photo
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              setPreview(await resizeToDataUrl(file));
            } catch {
              // unreadable image — keep the step usable
            }
          }}
        />
      </label>
      {preview && (
        <button
          onClick={() => onSubmit(preview)}
          className="w-full rounded-full bg-azure py-3.5 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
        >
          Continue
        </button>
      )}
      <button onClick={onSkip} className="w-full py-2 text-sm font-bold text-ink-soft">
        Skip
      </button>
    </div>
  );
}

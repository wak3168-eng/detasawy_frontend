"use client";

import { useEffect, useRef, useState } from "react";
import {
  getStaffPrompts,
  linkPrompt,
  setPromptActive,
  uploadPrompt,
  type StaffPrompt,
} from "@/lib/api";

export default function PromptManager() {
  const [kind, setKind] = useState<"picture" | "voice">("picture");
  const [source, setSource] = useState<"file" | "link">("file");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [licence, setLicence] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [captionPs, setCaptionPs] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<StaffPrompt[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getStaffPrompts().then(setPrompts, () => setPrompts([]));
  }, []);

  const upload = async () => {
    const media = fileRef.current?.files?.[0];
    const captions = {
      captionEn: captionEn.trim() || undefined,
      captionPs: captionPs.trim() || undefined,
    };
    if (source === "file" && !media) {
      setError(`Choose a ${kind === "picture" ? "photo" : "audio"} file first.`);
      return;
    }
    if (source === "link" && !/^https?:\/\//.test(mediaUrl.trim())) {
      setError("Paste a full media link (https://…).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created =
        source === "file" && media
          ? await uploadPrompt({ kind, media, ...captions })
          : await linkPrompt({
              kind,
              mediaUrl: mediaUrl.trim(),
              sourceUrl: sourceUrl.trim() || undefined,
              licence: licence.trim() || undefined,
              ...captions,
            });
      setPrompts((list) => [created, ...(list ?? [])]);
      setCaptionEn("");
      setCaptionPs("");
      setMediaUrl("");
      setSourceUrl("");
      setLicence("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (prompt: StaffPrompt) => {
    try {
      const updated = await setPromptActive(prompt.id, !prompt.active);
      setPrompts(
        (list) => list?.map((p) => (p.id === updated.id ? updated : p)) ?? null,
      );
    } catch {
      // list stays as-is
    }
  };

  return (
    <div className="rounded-3xl border border-mist bg-white/70 p-5">
      <div className="flex gap-2">
        {(["picture", "voice"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setKind(option)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              kind === option
                ? "bg-azure text-white"
                : "border border-mist text-ink-soft hover:bg-mist"
            }`}
          >
            {option === "picture" ? "📷 Picture" : "🎙 Voice note"}
          </button>
        ))}
      </div>
      <div className="mt-2.5 flex gap-2">
        {(["file", "link"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSource(option)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
              source === option
                ? "bg-ink text-white"
                : "border border-mist text-ink-soft hover:bg-mist"
            }`}
          >
            {option === "file" ? "Upload a file" : "Paste a link"}
          </button>
        ))}
      </div>
      <div className="mt-3 space-y-2.5">
        {source === "file" ? (
          <input
            ref={fileRef}
            type="file"
            accept={kind === "picture" ? "image/*" : "audio/*"}
            className="w-full rounded-2xl border border-mist bg-ice px-4 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-azure file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-white"
          />
        ) : (
          <>
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={
                kind === "picture"
                  ? "Image link (https://…)"
                  : "Audio link (https://…)"
              }
              className="w-full rounded-2xl border border-mist bg-ice px-4 py-2.5 text-sm outline-none transition-colors focus:border-azure"
            />
            <input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="Source page (optional)"
              className="w-full rounded-2xl border border-mist bg-ice px-4 py-2.5 text-sm outline-none transition-colors focus:border-azure"
            />
            <input
              value={licence}
              onChange={(e) => setLicence(e.target.value)}
              placeholder="Licence, e.g. CC BY-SA 4.0 (optional)"
              className="w-full rounded-2xl border border-mist bg-ice px-4 py-2.5 text-sm outline-none transition-colors focus:border-azure"
            />
          </>
        )}
        <input
          value={captionEn}
          onChange={(e) => setCaptionEn(e.target.value)}
          placeholder={
            kind === "picture" ? "English gloss (e.g. wooden door)" : "English note (optional)"
          }
          className="w-full rounded-2xl border border-mist bg-ice px-4 py-2.5 text-sm outline-none transition-colors focus:border-azure"
        />
        <input
          value={captionPs}
          onChange={(e) => setCaptionPs(e.target.value)}
          dir="rtl"
          lang="ps"
          placeholder="پښتو متن (اختیاري)"
          className="w-full rounded-2xl border border-mist bg-ice px-4 py-2.5 text-right font-naskh text-sm outline-none transition-colors focus:border-azure"
        />
        <button
          disabled={busy}
          onClick={upload}
          className="w-full rounded-full bg-azure py-2.5 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-50"
        >
          {busy ? "Saving…" : source === "file" ? "Upload" : "Add link"}
        </button>
        {error && (
          <p className="text-center text-xs font-semibold text-[#b4552d]">
            {error}
          </p>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {prompts === null && (
          <div className="h-14 animate-pulse rounded-2xl bg-mist/60" />
        )}
        {prompts?.length === 0 && (
          <p className="py-2 text-center text-xs text-ink-soft">
            Nothing uploaded yet.
          </p>
        )}
        {prompts?.map((prompt) => (
          <div
            key={prompt.id}
            className="flex items-center gap-3 rounded-2xl border border-mist bg-ice px-3.5 py-2.5"
          >
            {prompt.kind === "picture" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={prompt.mediaUrl}
                alt=""
                className="size-11 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mist">
                🎙
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                {prompt.captionEn || prompt.captionPs || `#${prompt.id}`}
              </p>
              <p className="truncate text-[11px] text-ink-soft">
                served ×{prompt.servedCount}
                {prompt.licence ? ` · ${prompt.licence}` : ""}
              </p>
            </div>
            <button
              onClick={() => toggle(prompt)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-colors ${
                prompt.active
                  ? "bg-azure text-white"
                  : "border border-mist text-ink-soft hover:bg-mist"
              }`}
            >
              {prompt.active ? "Active" : "Off"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

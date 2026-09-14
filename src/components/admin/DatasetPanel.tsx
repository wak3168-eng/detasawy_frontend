"use client";

import { useEffect, useState } from "react";
import { getDataset, type DatasetItem } from "@/lib/api";

const PAGE = 20;

function Row({ item }: { item: DatasetItem }) {
  const [open, setOpen] = useState(false);

  // every district line of every word, so the picture and the word can span
  // their own rows and the hierarchy reads straight across
  const lines = item.words.flatMap((word, wi) =>
    word.rows.map((place, pi) => ({ word, place, wi, pi })),
  );

  return (
    <div className="rounded-3xl border border-mist bg-white/70">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3.5 p-4 text-left"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.mediaUrl}
          alt=""
          className="size-14 shrink-0 rounded-xl border border-mist bg-white object-contain p-1"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold">{item.caption}</p>
          <p className="text-[11px] text-ink-soft">
            {item.words.length} word{item.words.length === 1 ? "" : "s"} ·{" "}
            {item.answers} answer{item.answers === 1 ? "" : "s"}
            {item.voices > 0 && ` · ${item.voices} with voice`}
            {item.kind === "scene" && " · scene"}
          </p>
        </div>
        <span className="shrink-0 text-xs font-bold text-azure-deep">
          {open ? "Hide" : "Open"}
        </span>
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-mist px-4 pb-4">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                <th className="py-2 pr-4">Picture</th>
                <th className="py-2 pr-4">Word</th>
                <th className="py-2 pr-4">District</th>
                <th className="py-2 pr-4">Tribe</th>
                <th className="py-2 pr-4">Clan</th>
                <th className="py-2 text-right">Voices</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 && (
                <tr className="border-t border-mist">
                  <td colSpan={6} className="py-4 text-center text-ink-soft">
                    No words yet.
                  </td>
                </tr>
              )}
              {lines.map(({ word, place, wi, pi }) => (
                <tr
                  key={`${wi}-${pi}`}
                  className={pi === 0 ? "border-t border-mist" : ""}
                >
                  {wi === 0 && pi === 0 && (
                    <td
                      rowSpan={lines.length}
                      className="border-t border-mist py-2 pr-4 align-top"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.mediaUrl}
                        alt={item.caption}
                        className="size-20 rounded-xl border border-mist bg-white object-contain p-1"
                      />
                      <p className="mt-1 max-w-24 text-[11px] font-bold">
                        {item.caption}
                      </p>
                    </td>
                  )}
                  {pi === 0 && (
                    <td
                      rowSpan={word.rows.length}
                      className="py-2 pr-4 align-top"
                    >
                      <span
                        dir="rtl"
                        lang="ps"
                        className="font-naskh text-xl font-bold"
                      >
                        {word.word}
                      </span>
                      <span className="ms-2 text-xs font-bold text-azure-deep">
                        ×{word.count}
                      </span>
                      {word.variants && word.variants.length > 0 && (
                        <p className="mt-0.5 text-[11px] text-ink-soft">
                          also{" "}
                          {word.variants.map((v, i) => (
                            <span key={v.word}>
                              {i > 0 && ", "}
                              <span dir="rtl" lang="ps" className="font-naskh">
                                {v.word}
                              </span>
                            </span>
                          ))}
                        </p>
                      )}
                    </td>
                  )}
                  <td className="py-2 pr-4 font-bold">{place.district}</td>
                  <td className="py-2 pr-4">{place.tribe}</td>
                  <td className="py-2 pr-4 text-ink-soft">
                    {place.clan ?? "—"}
                  </td>
                  <td className="py-2 text-right font-bold text-azure-deep">
                    {place.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DatasetPanel() {
  const [items, setItems] = useState<DatasetItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setFailed(false);
    getDataset({ q: query, all: showAll, limit: PAGE, offset }).then(
      (res) => {
        if (!alive) return;
        setItems(res.items);
        setTotal(res.total);
      },
      () => alive && setFailed(true),
    );
    return () => {
      alive = false;
    };
  }, [query, showAll, offset]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => {
            setOffset(0);
            setQuery(e.target.value);
          }}
          placeholder="Search a picture…"
          className="min-w-0 flex-1 rounded-2xl border border-mist bg-white/70 px-4 py-2.5 text-sm outline-none transition-colors focus:border-azure"
        />
        <button
          onClick={() => {
            setOffset(0);
            setShowAll((v) => !v);
          }}
          className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
            showAll
              ? "bg-ink text-white"
              : "border border-mist text-ink-soft hover:bg-mist"
          }`}
        >
          {showAll ? "All pictures" : "Answered only"}
        </button>
      </div>

      <p className="mt-2 text-[11px] text-ink-soft">
        {showAll
          ? "Every picture in the collection."
          : "Pictures people have named, most answered first."}{" "}
        {total > 0 && `${total} in total.`}
      </p>

      <div className="mt-4 space-y-2.5">
        {failed && (
          <p className="rounded-3xl border border-mist bg-white/70 p-7 text-center text-sm text-ink-soft">
            Couldn&apos;t load the dataset.
          </p>
        )}
        {items === null && !failed && (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-3xl bg-mist/60"
              />
            ))}
          </>
        )}
        {items?.length === 0 && (
          <p className="rounded-3xl border border-mist bg-white/70 p-7 text-center text-sm text-ink-soft">
            {query
              ? `Nothing matching “${query}”.`
              : "No words collected yet — they appear here as people answer."}
          </p>
        )}
        {items?.map((item) => <Row key={item.id} item={item} />)}
      </div>

      {total > PAGE && (
        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={offset === 0}
            onClick={() => setOffset((o) => Math.max(0, o - PAGE))}
            className="rounded-full border border-mist px-4 py-2 text-xs font-bold text-ink-soft transition-colors hover:bg-mist disabled:opacity-40"
          >
            Back
          </button>
          <span className="text-[11px] text-ink-soft">
            {offset + 1}–{Math.min(offset + PAGE, total)} of {total}
          </span>
          <button
            disabled={offset + PAGE >= total}
            onClick={() => setOffset((o) => o + PAGE)}
            className="rounded-full border border-mist px-4 py-2 text-xs font-bold text-ink-soft transition-colors hover:bg-mist disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

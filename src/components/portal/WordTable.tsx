"use client";

import { useEffect, useState } from "react";
import { getPromptWords, type WordGroup } from "@/lib/api";

export default function WordTable({ promptId }: { promptId: number }) {
  const [groups, setGroups] = useState<WordGroup[] | null>(null);

  useEffect(() => {
    getPromptWords(promptId).then(setGroups, () => setGroups([]));
  }, [promptId]);

  if (groups === null) {
    return <div className="h-24 animate-pulse rounded-2xl bg-mist/60" />;
  }

  if (groups.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-ink-soft">
        You&apos;re the first — more words will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.word}>
          <p className="flex items-baseline gap-2.5">
            <span dir="rtl" lang="ps" className="font-naskh text-2xl font-bold">
              {group.word}
            </span>
            <span className="text-xs font-bold text-azure-deep">
              ×{group.count}
            </span>
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                  <th className="py-1.5 pr-3 font-bold">District</th>
                  <th className="py-1.5 pr-3 font-bold">Tribe</th>
                  <th className="py-1.5 pr-3 font-bold">Clan</th>
                  <th className="py-1.5 text-right font-bold">Voices</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, i) => (
                  <tr key={i} className="border-t border-mist">
                    <td className="py-2 pr-3 font-bold">{row.district}</td>
                    <td className="py-2 pr-3">{row.tribe}</td>
                    <td className="py-2 pr-3 text-ink-soft">
                      {row.clan ?? "—"}
                    </td>
                    <td className="py-2 text-right font-bold text-azure-deep">
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

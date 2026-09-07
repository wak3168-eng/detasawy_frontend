"use client";

import { useEffect, useMemo, useState } from "react";
import StepChoice from "@/components/onboarding/StepChoice";
import StepDone from "@/components/onboarding/StepDone";
import StepPhoto from "@/components/onboarding/StepPhoto";
import StepSelect from "@/components/onboarding/StepSelect";
import StepShell from "@/components/onboarding/StepShell";
import StepText from "@/components/onboarding/StepText";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  type ProfileDraft,
} from "@/lib/profileDraft";
import type { RefOption } from "@/lib/refTypes";

type Stage =
  | "welcome"
  | "country"
  | "province"
  | "district"
  | "tehsil"
  | "city"
  | "tribe"
  | "lineage"
  | "photo"
  | "done";

const PROGRESS: Record<Stage, number> = {
  welcome: 0.02,
  country: 0.12,
  province: 0.25,
  district: 0.4,
  tehsil: 0.5,
  city: 0.5,
  tribe: 0.62,
  lineage: 0.78,
  photo: 0.9,
  done: 1,
};

type Snapshot = { stage: Stage; draft: ProfileDraft };

export default function Wizard() {
  const [draft, setDraft] = useState<ProfileDraft>({});
  const [stage, setStage] = useState<Stage>("welcome");
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadDraft();
    setDraft(loaded);
    if (loaded.completedAt) setStage("done");
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveDraft(draft);
  }, [draft, ready]);

  const advance = (next: Stage, patch: Partial<ProfileDraft>) => {
    setHistory((h) => [...h, { stage, draft }]);
    setDraft((d) => ({ ...d, ...patch }));
    setStage(next);
  };

  const back = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setDraft(prev.draft);
    setStage(prev.stage);
  };

  const lastTribe = useMemo(
    () => draft.tribePath?.[draft.tribePath.length - 1],
    [draft.tribePath],
  );

  if (!ready) return null;

  const shell = (
    title: string,
    subtitle: string | undefined,
    children: React.ReactNode,
  ) => (
    <StepShell
      progress={PROGRESS[stage]}
      onBack={history.length > 0 && stage !== "done" ? back : undefined}
      title={title}
      subtitle={subtitle}
      audioSrc={`/audio/onboarding/${stage}.mp3`}
    >
      {children}
    </StepShell>
  );

  switch (stage) {
    case "welcome":
      return shell(
        draft.name ? `Salaam, ${draft.name} 👋` : "Salaam 👋",
        "A few quick questions — about 30 seconds.",
        <button
          onClick={() => advance("country", {})}
          className="w-full rounded-full bg-azure py-3.5 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
        >
          Start
        </button>,
      );

    case "country":
      return shell(
        "Where are you from?",
        undefined,
        <StepChoice
          choices={[
            { id: "pk", name: "Pakistan" },
            { id: "af", name: "Afghanistan" },
            { id: "overseas", name: "Overseas", hint: "living abroad" },
          ]}
          onPick={(c) =>
            advance("province", {
              country: { id: c.id, name: c.name },
              province: undefined,
              district: undefined,
              tehsil: undefined,
              city: undefined,
              tribePath: undefined,
              language: undefined,
            })
          }
        />,
      );

    case "province": {
      const overseas = draft.country?.id === "overseas";
      return shell(
        overseas ? "Where do you live?" : "Which province?",
        undefined,
        <StepSelect
          endpoint={`/api/ref/provinces?country=${draft.country?.id}`}
          onPick={(o) =>
            advance(overseas ? "city" : "district", {
              province: { id: o.id, name: o.name },
              district: undefined,
              tehsil: undefined,
            })
          }
          onCustom={(name) =>
            advance(overseas ? "city" : "district", {
              province: { name, pending: true },
            })
          }
          addLabel="Somewhere else? Add it"
        />,
      );
    }

    case "district":
      return shell(
        "Which district?",
        undefined,
        <StepSelect
          endpoint={`/api/ref/districts?province=${draft.province?.id ?? ""}`}
          emptyPlaceholder="Type your district"
          onPick={(o) =>
            advance(o.hasTehsils ? "tehsil" : "tribe", {
              district: { id: o.id, name: o.name },
              tehsil: undefined,
              language: o.language,
            })
          }
          onCustom={(name) =>
            advance("tribe", { district: { name, pending: true } })
          }
          onSkip={() => advance("tribe", { district: undefined })}
          skipLabel="Skip"
        />,
      );

    case "tehsil":
      return shell(
        "Which tehsil?",
        draft.district?.name,
        <StepSelect
          endpoint={`/api/ref/tehsils?district=${draft.district?.id ?? ""}`}
          onPick={(o) => advance("tribe", { tehsil: { id: o.id, name: o.name } })}
          onCustom={(name) =>
            advance("tribe", { tehsil: { name, pending: true } })
          }
          onSkip={() => advance("tribe", { tehsil: undefined })}
          skipLabel="Skip"
        />,
      );

    case "city":
      return shell(
        "Which city?",
        draft.province?.name,
        <StepText
          placeholder="Type your city"
          onSubmit={(city) => advance("tribe", { city })}
          onSkip={() => advance("tribe", { city: undefined })}
          skipLabel="Skip"
        />,
      );

    case "tribe": {
      const districtParam = draft.district?.id
        ? `?district=${draft.district.id}`
        : "";
      return shell(
        "Your tribe?",
        "Tribes from your area are listed first.",
        <StepSelect
          endpoint={`/api/ref/tribes${districtParam}`}
          onPick={(o) =>
            advance(o.hasChildren ? "lineage" : "photo", {
              tribePath: [{ id: o.id, name: o.name }],
            })
          }
          onCustom={(name) =>
            advance("photo", { tribePath: [{ name, pending: true }] })
          }
          onSkip={() => advance("photo", { tribePath: [] })}
          skipLabel="Prefer not to say"
          addLabel="Can't find your tribe? Add it"
        />,
      );
    }

    case "lineage":
      return shell(
        `Sub-tribe of ${lastTribe?.name}?`,
        "Only if you know it.",
        <StepSelect
          endpoint={`/api/ref/tribes?parent=${lastTribe?.id ?? ""}`}
          onPick={(o) => {
            const path = [...(draft.tribePath ?? []), { id: o.id, name: o.name }];
            advance(o.hasChildren ? "lineage" : "photo", { tribePath: path });
          }}
          onCustom={(name) =>
            advance("photo", {
              tribePath: [...(draft.tribePath ?? []), { name, pending: true }],
            })
          }
          onSkip={() => advance("photo", {})}
          skipLabel="That's as far as I know"
          addLabel="Can't find it? Add yours"
        />,
      );

    case "photo":
      return shell(
        "Add a photo?",
        "Optional — you can always add one later.",
        <StepPhoto
          onSubmit={(photo) =>
            advance("done", { photo, completedAt: new Date().toISOString() })
          }
          onSkip={() =>
            advance("done", { completedAt: new Date().toISOString() })
          }
        />,
      );

    case "done":
      return (
        <StepShell progress={1} title="You're in." subtitle="Here's your profile.">
          <StepDone draft={draft} />
          <button
            onClick={() => {
              clearDraft();
              setDraft({});
              setHistory([]);
              setStage("welcome");
            }}
            className="mt-4 w-full py-2 text-center text-xs font-bold text-ink-soft"
          >
            Start over
          </button>
        </StepShell>
      );
  }
}

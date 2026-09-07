"use client";

import { useEffect, useMemo, useState } from "react";
import StepChoice from "@/components/onboarding/StepChoice";
import StepDone from "@/components/onboarding/StepDone";
import StepPhoto from "@/components/onboarding/StepPhoto";
import StepSelect from "@/components/onboarding/StepSelect";
import StepShell from "@/components/onboarding/StepShell";
import StepText from "@/components/onboarding/StepText";
import { saveProfile, uploadProfilePhoto } from "@/lib/api";
import { hasToken } from "@/lib/auth";
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
  | "residence"
  | "city"
  | "origin"
  | "province"
  | "district"
  | "tehsil"
  | "tribe"
  | "lineage"
  | "language"
  | "photo"
  | "done";

const PROGRESS: Record<Stage, number> = {
  welcome: 0.02,
  country: 0.12,
  residence: 0.2,
  city: 0.28,
  origin: 0.34,
  province: 0.42,
  district: 0.52,
  tehsil: 0.6,
  tribe: 0.68,
  lineage: 0.78,
  language: 0.86,
  photo: 0.94,
  done: 1,
};

type Snapshot = { stage: Stage; draft: ProfileDraft };

export default function Wizard() {
  const [draft, setDraft] = useState<ProfileDraft>({});
  const [stage, setStage] = useState<Stage>("welcome");
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [ready, setReady] = useState(false);
  const [nextHref, setNextHref] = useState("/");

  useEffect(() => {
    const loaded = loadDraft();
    setDraft(loaded);
    if (loaded.completedAt) setStage("done");
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      setNextHref(next);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveDraft(draft);
  }, [draft, ready]);

  useEffect(() => {
    if (ready && stage === "done" && draft.completedAt && hasToken()) {
      saveProfile(draft).catch(() => {});
      // a freshly picked photo is still a local data URL — store it server-side
      if (draft.photo?.startsWith("data:")) {
        uploadProfilePhoto(draft.photo).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, stage]);

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
    titlePs: string | undefined,
    subtitle: string | undefined,
    children: React.ReactNode,
  ) => (
    <StepShell
      progress={PROGRESS[stage]}
      onBack={history.length > 0 && stage !== "done" ? back : undefined}
      title={title}
      titlePs={titlePs}
      subtitle={subtitle}
      audioSrc={`/audio/onboarding/${stage}.mp3`}
    >
      {children}
    </StepShell>
  );

  const overseas = draft.country?.id === "overseas";
  const originId = overseas ? draft.origin?.id : draft.country?.id;

  switch (stage) {
    case "welcome":
      return shell(
        draft.name ? `Hello, ${draft.name} 👋` : "Hello 👋",
        "سلام",
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
        "ته د کوم ځای یې؟",
        undefined,
        <StepChoice
          choices={[
            { id: "pk", name: "Pakistan", ps: "پاکستان" },
            { id: "af", name: "Afghanistan", ps: "افغانستان" },
            {
              id: "overseas",
              name: "Overseas",
              ps: "بهر",
              hint: "living abroad",
            },
          ]}
          onPick={(c) =>
            advance(c.id === "overseas" ? "residence" : "province", {
              country: { id: c.id, name: c.name },
              residence: undefined,
              origin: undefined,
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

    case "residence":
      return shell(
        "Which country do you live in?",
        "په کوم هیواد کې اوسېږې؟",
        undefined,
        <StepSelect
          endpoint="/api/ref/provinces?country=overseas"
          onPick={(o) =>
            advance("city", { residence: { id: o.id, name: o.name } })
          }
          onCustom={(name, ps) =>
            advance("city", { residence: { name, ps, pending: true } })
          }
          addLabel="Somewhere else? Add it"
        />,
      );

    case "city":
      return shell(
        "Which city?",
        "کوم ښار؟",
        draft.residence?.name,
        <StepText
          placeholder="Type your city"
          onSubmit={(city) => advance("origin", { city })}
          onSkip={() => advance("origin", { city: undefined })}
          skipLabel="Skip"
        />,
      );

    case "origin":
      return shell(
        "Where is your family from?",
        "کورنۍ مو د کوم ځای ده؟",
        "Your Pashto comes from there — that's what we're recording.",
        <StepChoice
          choices={[
            { id: "pk", name: "Pakistan", ps: "پاکستان" },
            { id: "af", name: "Afghanistan", ps: "افغانستان" },
          ]}
          onPick={(c) =>
            advance("province", {
              origin: { id: c.id, name: c.name },
              province: undefined,
              district: undefined,
              tehsil: undefined,
            })
          }
        />,
      );

    case "province":
      return shell(
        "Which province?",
        "کوم ولایت؟",
        undefined,
        <StepSelect
          endpoint={`/api/ref/provinces?country=${originId ?? ""}`}
          onPick={(o) =>
            advance("district", {
              province: { id: o.id, name: o.name },
              district: undefined,
              tehsil: undefined,
            })
          }
          onCustom={(name, ps) =>
            advance("district", { province: { name, ps, pending: true } })
          }
          addLabel="Somewhere else? Add it"
        />,
      );

    case "district":
      return shell(
        "Which district?",
        "کوم ولسوالي؟",
        draft.province?.name,
        <StepSelect
          endpoint={`/api/ref/districts?province=${draft.province?.id ?? ""}`}
          emptyPlaceholder="Type your district"
          onPick={(o) =>
            advance(o.hasTehsils ? "tehsil" : "tribe", {
              district: { id: o.id, name: o.name },
              tehsil: undefined,
            })
          }
          onCustom={(name, ps) =>
            advance("tribe", { district: { name, ps, pending: true } })
          }
          onSkip={() => advance("tribe", { district: undefined })}
          skipLabel="Skip"
        />,
      );

    case "tehsil":
      return shell(
        "Which tehsil?",
        "کومه تحصیل؟",
        draft.district?.name,
        <StepSelect
          endpoint={`/api/ref/tehsils?district=${draft.district?.id ?? ""}`}
          onPick={(o) => advance("tribe", { tehsil: { id: o.id, name: o.name } })}
          onCustom={(name, ps) =>
            advance("tribe", { tehsil: { name, ps, pending: true } })
          }
          onSkip={() => advance("tribe", { tehsil: undefined })}
          skipLabel="Skip"
        />,
      );

    case "tribe": {
      const scope = draft.district?.id
        ? `?district=${draft.district.id}`
        : draft.province?.id
          ? `?province=${draft.province.id}`
          : "";
      return shell(
        "Your tribe?",
        "قوم مو څه دی؟",
        "Tribes from your area are listed first.",
        <StepSelect
          endpoint={`/api/ref/tribes${scope}`}
          onPick={(o) =>
            advance("lineage", {
              tribePath: [{ id: o.id, name: o.name, ps: o.ps }],
            })
          }
          onCustom={(name, ps) =>
            advance("lineage", { tribePath: [{ name, ps, pending: true }] })
          }
          onSkip={() => advance("language", { tribePath: [] })}
          skipLabel="Prefer not to say"
          addLabel="Can't find your tribe? Add it"
        />,
      );
    }

    case "lineage":
      return shell(
        `Sub-tribe of ${lastTribe?.name}?`,
        "کومه څانګه؟",
        "Only if you know it — you can add one that isn't listed.",
        <StepSelect
          // a tribe the contributor just added has no id yet, so there is
          // nothing to list — the sentinel returns an empty set and the step
          // becomes a plain "type the sub-tribe" form
          endpoint={`/api/ref/tribes?parent=${lastTribe?.id ?? "__new__"}`}
          emptyPlaceholder={`Sub-tribe of ${lastTribe?.name ?? "your tribe"}`}
          onPick={(o) => {
            const path = [
              ...(draft.tribePath ?? []),
              { id: o.id, name: o.name, ps: o.ps },
            ];
            advance("lineage", { tribePath: path });
          }}
          onCustom={(name, ps) =>
            advance("lineage", {
              tribePath: [
                ...(draft.tribePath ?? []),
                { name, ps, pending: true },
              ],
            })
          }
          onSkip={() => advance("language", {})}
          skipLabel="That's as far as I know"
          addLabel={`Add a sub-tribe of ${lastTribe?.name ?? "it"}`}
        />,
      );

    case "language":
      return shell(
        "Your language?",
        "کومه ژبه وایې؟",
        "The one you speak at home.",
        <StepSelect
          endpoint="/api/ref/languages"
          onPick={(o) => advance("photo", { language: o.name })}
          onCustom={(name) => advance("photo", { language: name })}
          onSkip={() => advance("photo", { language: undefined })}
          skipLabel="Skip"
          addLabel="Can't find it? Add yours"
        />,
      );

    case "photo":
      return shell(
        "Add a photo?",
        "انځور مو ولیکئ؟",
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
        <StepShell
          progress={1}
          title="You're in."
          titlePs="ښه راغلاست"
          subtitle="Here's your profile."
        >
          <StepDone draft={draft} nextHref={nextHref} />
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

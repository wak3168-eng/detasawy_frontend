import type { DraftPlace, DraftTribe, ProfileDraft } from "@/lib/profileDraft";

export type ServerProfile = {
  country: DraftPlace | null;
  residence: DraftPlace | null;
  province: DraftPlace | null;
  district: DraftPlace | null;
  tehsil: DraftPlace | null;
  city: string;
  tribePath: DraftTribe[] | null;
  language: string;
  completedAt: string | null;
  photoUrl?: string | null;
};

export function draftToPayload(draft: ProfileDraft) {
  return {
    // for the diaspora the origin country is the one that shapes the dialect,
    // so it is what we store as `country`; where they live goes to `residence`
    country: draft.origin ?? draft.country ?? null,
    residence: draft.residence ?? null,
    province: draft.province ?? null,
    district: draft.district ?? null,
    tehsil: draft.tehsil ?? null,
    city: draft.city ?? "",
    tribePath: draft.tribePath ?? [],
    language: draft.language ?? "",
    completedAt: draft.completedAt ?? null,
  };
}

export function profileToDraft(
  profile: ServerProfile,
  name?: string,
  photo?: string,
): ProfileDraft {
  const abroad = profile.residence ?? undefined;
  return {
    name,
    // the stored photo is the source of truth; the local copy is a fallback
    photo: profile.photoUrl ?? photo,
    country: abroad
      ? { id: "overseas", name: "Overseas" }
      : (profile.country ?? undefined),
    residence: abroad,
    origin: abroad ? (profile.country ?? undefined) : undefined,
    province: profile.province ?? undefined,
    district: profile.district ?? undefined,
    tehsil: profile.tehsil ?? undefined,
    city: profile.city || undefined,
    tribePath: profile.tribePath?.length ? profile.tribePath : undefined,
    language: profile.language || undefined,
    completedAt: profile.completedAt ?? undefined,
  };
}

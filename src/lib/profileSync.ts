import type { DraftPlace, DraftTribe, ProfileDraft } from "@/lib/profileDraft";

export type ServerProfile = {
  country: DraftPlace | null;
  province: DraftPlace | null;
  district: DraftPlace | null;
  tehsil: DraftPlace | null;
  city: string;
  tribePath: DraftTribe[] | null;
  language: string;
  completedAt: string | null;
};

export function draftToPayload(draft: ProfileDraft) {
  return {
    country: draft.country ?? null,
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
  return {
    name,
    photo,
    country: profile.country ?? undefined,
    province: profile.province ?? undefined,
    district: profile.district ?? undefined,
    tehsil: profile.tehsil ?? undefined,
    city: profile.city || undefined,
    tribePath: profile.tribePath?.length ? profile.tribePath : undefined,
    language: profile.language || undefined,
    completedAt: profile.completedAt ?? undefined,
  };
}

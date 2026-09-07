"use client";

import { useEffect } from "react";
import { getMe, saveProfile } from "@/lib/api";
import { hasToken } from "@/lib/auth";
import { loadDraft, saveDraft } from "@/lib/profileDraft";
import { profileToDraft } from "@/lib/profileSync";

/**
 * Keeps the local draft and the account profile in sync when logged in:
 * a completed server profile wins (log in on a new device restores it);
 * a completed local draft with an empty server profile is pushed up.
 */
export default function ProfileHydrator() {
  useEffect(() => {
    if (!hasToken()) return;
    const local = loadDraft();
    getMe()
      .then(({ user, profile }) => {
        if (profile.completedAt) {
          saveDraft(
            profileToDraft(profile, user.name || local.name, local.photo),
          );
        } else if (local.completedAt) {
          saveProfile(local).catch(() => {});
        } else if (user.name && !local.name) {
          saveDraft({ ...local, name: user.name });
        }
      })
      .catch(() => {});
  }, []);

  return null;
}

"use client";

import { useEffect, useState } from "react";
import {
  createCampaign,
  endCampaign,
  getStaffCampaigns,
  type StaffCampaign,
} from "@/lib/api";
import { fetchRef } from "@/lib/refClient";
import type { RefOption } from "@/lib/refTypes";

const STATUS_STYLES: Record<StaffCampaign["status"], string> = {
  live: "bg-azure text-white",
  upcoming: "bg-sky text-ink",
  ended: "bg-mist text-ink-soft",
};

function toLocalInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function CampaignManager() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scopeType, setScopeType] = useState<"all" | "province" | "district">("all");
  const [provinces, setProvinces] = useState<RefOption[]>([]);
  const [districts, setDistricts] = useState<RefOption[]>([]);
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [startsAt, setStartsAt] = useState(() => toLocalInput(new Date()));
  const [endsAt, setEndsAt] = useState(() =>
    toLocalInput(new Date(Date.now() + 7 * 86_400_000)),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<StaffCampaign[] | null>(null);

  useEffect(() => {
    getStaffCampaigns().then(setCampaigns, () => setCampaigns([]));
  }, []);

  useEffect(() => {
    if (scopeType === "all") return;
    Promise.all([
      fetchRef("/api/ref/provinces?country=pk"),
      fetchRef("/api/ref/provinces?country=af"),
    ]).then(([pk, af]) => setProvinces([...pk, ...af]), () => {});
  }, [scopeType]);

  useEffect(() => {
    if (scopeType !== "district" || !provinceId) return;
    fetchRef(`/api/ref/districts?province=${provinceId}`).then(
      setDistricts,
      () => setDistricts([]),
    );
  }, [scopeType, provinceId]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const scope =
        scopeType === "district"
          ? districts.find((d) => d.id === districtId)
          : scopeType === "province"
            ? provinces.find((p) => p.id === provinceId)
            : undefined;
      if (scopeType !== "all" && !scope) {
        throw new Error("Pick the scope first.");
      }
      const created = await createCampaign({
        name: name.trim(),
        description: description.trim() || undefined,
        scopeType,
        scopeId: scope?.id,
        scopeName: scope?.name,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });
      setCampaigns((list) => [created, ...(list ?? [])]);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create.");
    } finally {
      setBusy(false);
    }
  };

  const end = async (campaign: StaffCampaign) => {
    try {
      const updated = await endCampaign(campaign.id);
      setCampaigns(
        (list) => list?.map((c) => (c.id === updated.id ? updated : c)) ?? null,
      );
    } catch {
      // row stays
    }
  };

  const selectClass =
    "w-full rounded-2xl border border-mist bg-ice px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-azure";

  return (
    <div className="rounded-3xl border border-mist bg-white/70 p-5">
      <div className="space-y-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Campaign name (e.g. Khyber week)"
          className={selectClass}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="One line about it (optional)"
          className={selectClass}
        />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <select
            value={scopeType}
            onChange={(e) => {
              setScopeType(e.target.value as typeof scopeType);
              setProvinceId("");
              setDistrictId("");
            }}
            className={selectClass}
          >
            <option value="all">Everyone</option>
            <option value="province">A province</option>
            <option value="district">A district</option>
          </select>
          {scopeType !== "all" && (
            <select
              value={provinceId}
              onChange={(e) => setProvinceId(e.target.value)}
              className={selectClass}
            >
              <option value="">Province…</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          {scopeType === "district" && (
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className={selectClass}
            >
              <option value="">District…</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-ink-soft">
              Starts
            </span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={selectClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-ink-soft">
              Ends
            </span>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={selectClass}
            />
          </label>
        </div>
        <button
          disabled={busy || !name.trim()}
          onClick={submit}
          className="w-full rounded-full bg-azure py-2.5 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create campaign"}
        </button>
        {error && (
          <p className="text-center text-xs font-semibold text-[#b4552d]">
            {error}
          </p>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {campaigns === null && (
          <div className="h-12 animate-pulse rounded-2xl bg-mist/60" />
        )}
        {campaigns?.length === 0 && (
          <p className="py-2 text-center text-xs text-ink-soft">
            No campaigns yet.
          </p>
        )}
        {campaigns?.map((campaign) => (
          <div
            key={campaign.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-mist bg-ice px-3.5 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{campaign.name}</p>
              <p className="text-[11px] text-ink-soft">
                {campaign.scopeName ?? "Everyone"} ·{" "}
                {new Date(campaign.startsAt).toLocaleDateString()} →{" "}
                {new Date(campaign.endsAt).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLES[campaign.status]}`}
            >
              {campaign.status}
            </span>
            {campaign.status !== "ended" && (
              <button
                onClick={() => end(campaign)}
                className="rounded-full border border-mist px-3.5 py-1.5 text-[11px] font-bold text-ink-soft transition-colors hover:bg-mist"
              >
                End now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

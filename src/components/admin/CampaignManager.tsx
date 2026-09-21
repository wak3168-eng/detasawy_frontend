"use client";
import { useEffect, useState } from "react";
import { createCampaign, endCampaign, type StaffCampaign } from "@/lib/api";
import { fetchRef } from "@/lib/refClient";
import type { RefOption } from "@/lib/refTypes";
import { date, ErrorNotice, Loading, useAdminQuery } from "./AdminUI";
const localDate = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
export default function CampaignManager() {
  const {
    data,
    error: loadError,
    reload,
  } = useAdminQuery<StaffCampaign[]>("/api/admin/campaigns");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scopeType, setScopeType] = useState<"all" | "province" | "district">(
    "all",
  );
  const [provinces, setProvinces] = useState<RefOption[]>([]);
  const [districts, setDistricts] = useState<RefOption[]>([]);
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [startsAt, setStartsAt] = useState(() => localDate(new Date()));
  const [endsAt, setEndsAt] = useState(() =>
    localDate(new Date(Date.now() + 7 * 86400000)),
  );
  const [busy, setBusy] = useState(false);
  const [ending, setEnding] = useState<number>();
  const [confirm, setConfirm] = useState<number>();
  const [error, setError] = useState("");
  const [refError, setRefError] = useState("");
  const [refRevision, setRefRevision] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!adding || scopeType === "all") return;
    let alive = true;
    Promise.all([
      fetchRef("/api/ref/provinces?country=pk"),
      fetchRef("/api/ref/provinces?country=af"),
    ]).then(
      ([pk, af]) => {
        if (alive) {
          setProvinces([...pk, ...af]);
          setRefError("");
        }
      },
      () => {
        if (alive) setRefError("Could not load provinces.");
      },
    );
    return () => {
      alive = false;
    };
  }, [adding, scopeType, refRevision]);
  useEffect(() => {
    if (scopeType !== "district" || !provinceId) return;
    let alive = true;
    fetchRef(
      `/api/ref/districts?province=${encodeURIComponent(provinceId)}`,
    ).then(
      (rows) => {
        if (alive) {
          setDistricts(rows);
          setRefError("");
        }
      },
      () => {
        if (alive) setRefError("Could not load districts.");
      },
    );
    return () => {
      alive = false;
    };
  }, [scopeType, provinceId, refRevision]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (new Date(endsAt) <= new Date(startsAt))
        throw new Error("End time must be after start time.");
      const scope =
        scopeType === "district"
          ? districts.find((d) => d.id === districtId)
          : provinces.find((p) => p.id === provinceId);
      if (scopeType !== "all" && !scope)
        throw new Error("Select a valid campaign audience.");
      await createCampaign({
        name: name.trim(),
        description: description.trim(),
        scopeType,
        scopeId: scope?.id,
        scopeName: scope?.name,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });
      setName("");
      setDescription("");
      setAdding(false);
      setNotice("Campaign created.");
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create campaign.");
    } finally {
      setBusy(false);
    }
  }
  async function end(id: number) {
    setEnding(id);
    setError("");
    setNotice("");
    try {
      await endCampaign(id);
      setConfirm(undefined);
      setNotice("Campaign ended.");
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not end campaign.");
    } finally {
      setEnding(undefined);
    }
  }
  return (
    <>
      <div className="admin-toolbar">
        <p className="admin-note">
          Organise contribution drives by location and time.
        </p>
        <button
          className="admin-button primary"
          disabled={busy}
          aria-expanded={adding}
          onClick={() => setAdding(!adding)}
        >
          + New campaign
        </button>
      </div>
      <ErrorNotice message={error} />
      {notice && (
        <div className="admin-success" role="status">
          {notice}
        </div>
      )}
      {adding && (
        <section className="admin-panel mb-6">
          <div className="admin-panel-heading">
            <h2>Campaign details</h2>
          </div>
          <form className="admin-form" onSubmit={save}>
            <fieldset disabled={busy} className="contents">
              <div className="admin-form-grid">
                <label>
                  Campaign name
                  <input
                    required
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  Description <small>Optional</small>
                  <input
                    maxLength={200}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>
              </div>
              <label>
                Audience
                <select
                  value={scopeType}
                  onChange={(e) => {
                    setScopeType(e.target.value as typeof scopeType);
                    setProvinceId("");
                    setDistrictId("");
                    setDistricts([]);
                  }}
                >
                  <option value="all">Everyone</option>
                  <option value="province">Province</option>
                  <option value="district">District</option>
                </select>
              </label>
              <div className="admin-form-grid">
                {scopeType !== "all" && (
                  <label>
                    Province
                    <select
                      required
                      value={provinceId}
                      onChange={(e) => {
                        setProvinceId(e.target.value);
                        setDistrictId("");
                        setDistricts([]);
                      }}
                    >
                      <option value="">Select province</option>
                      {provinces.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {scopeType === "district" && (
                  <label>
                    District
                    <select
                      required
                      disabled={!provinceId}
                      value={districtId}
                      onChange={(e) => setDistrictId(e.target.value)}
                    >
                      <option value="">Select district</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <ErrorNotice
                message={scopeType === "all" ? "" : refError}
                retry={() => setRefRevision((n) => n + 1)}
              />
              <div className="admin-form-grid">
                <label>
                  Starts
                  <input
                    required
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </label>
                <label>
                  Ends
                  <input
                    required
                    type="datetime-local"
                    value={endsAt}
                    min={startsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                  />
                </label>
              </div>
              <small>Dates use your device’s local time zone.</small>
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-button"
                  onClick={() => setAdding(false)}
                >
                  Cancel
                </button>
                <button className="admin-button primary">
                  {busy ? "Creating…" : "Create campaign"}
                </button>
              </div>
            </fieldset>
          </form>
        </section>
      )}
      <ErrorNotice message={loadError} retry={reload} />
      {!data && !loadError && <Loading />}
      {data && (
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Recent campaigns</h2>
              <p>Up to 30 campaigns, ordered by end date</p>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Audience</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      <small className="block text-ink-soft">
                        {c.description}
                      </small>
                    </td>
                    <td>{c.scopeName || "Everyone"}</td>
                    <td className="whitespace-nowrap">
                      {date(c.startsAt)}
                      <small className="block text-ink-soft">
                        to {date(c.endsAt)}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${c.status === "live" ? "green" : c.status === "upcoming" ? "amber" : ""}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.status !== "ended" &&
                        (confirm === c.id ? (
                          <div className="flex gap-2">
                            <button
                              className="admin-button"
                              disabled={ending !== undefined}
                              onClick={() => end(c.id)}
                            >
                              {ending === c.id ? "Ending…" : "Confirm end"}
                            </button>
                            <button
                              className="admin-button"
                              disabled={ending !== undefined}
                              onClick={() => setConfirm(undefined)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="admin-button"
                            disabled={ending !== undefined}
                            onClick={() => setConfirm(c.id)}
                          >
                            End campaign
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.length && (
            <div className="admin-empty">
              No campaigns yet. Create a drive when you are ready to invite
              contributions.
            </div>
          )}
        </section>
      )}
    </>
  );
}

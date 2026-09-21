"use client";
import Link from "next/link";
import type { OverviewStats as Stats } from "@/lib/api";
import { ErrorNotice, Loading, useAdminQuery } from "./AdminUI";
import { useAdminUser } from "./AdminWorkspace";
import { allowed } from "./sections";
export default function OverviewStats() {
  const {
    data: s,
    error,
    reload,
  } = useAdminQuery<Stats>("/api/admin/overview");
  const role = useAdminUser()?.role ?? "contributor";
  if (error) return <ErrorNotice message={error} retry={reload} />;
  if (!s) return <Loading />;
  const coverage = s.pictures
    ? Math.round((s.picturesAnswered / s.pictures) * 100)
    : 0;
  const voice = s.contributions
    ? Math.round((s.voiceNotes / s.contributions) * 100)
    : 0;
  const tiles = [
    [
      "Contributions",
      s.contributions,
      `${s.contributionsToday} today · ${s.contributionsWeek} this week`,
    ],
    [
      "Audio recordings",
      s.voiceNotes,
      `${voice}% of contributions include audio`,
    ],
    ["Active contributors", s.contributors, `${s.users} registered accounts`],
    [
      "Districts represented",
      s.districtsCovered,
      "Based on contribution metadata",
    ],
  ] as const;
  const tasks = [
    {
      slug: "prompts",
      title: "Manage the prompt library",
      detail: `${s.picturesActive} active pictures available to contributors`,
      action: "Open library",
    },
    {
      slug: "review",
      title: "Review reference suggestions",
      detail: `${s.suggestionsPending} pending suggestions for reference data`,
      action: "View queue",
    },
    {
      slug: "contributions",
      title: "Inspect collected responses",
      detail: "Read original text and listen to available recordings",
      action: "View records",
    },
    {
      slug: "team",
      title: "Manage people and access",
      detail: `${s.profilesCompleted} of ${s.users} profiles completed`,
      action: "View people",
    },
  ];
  return (
    <>
      <div className="admin-toolbar">
        <span className="admin-note">
          Collection activity · all time unless indicated
        </span>
        <button className="admin-button" onClick={reload}>
          Refresh data
        </button>
      </div>
      <div className="admin-stats">
        {tiles.map(([label, value, detail]) => (
          <div className="admin-stat" key={label}>
            <p>{label}</p>
            <strong>{value.toLocaleString()}</strong>
            <small>{detail}</small>
          </div>
        ))}
      </div>
      <div className="admin-columns">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Collection coverage</h2>
              <p>How much of the picture library has a response?</p>
            </div>
            <span className="admin-badge">{coverage}% answered</span>
          </div>
          <div className="admin-coverage">
            <div>
              <strong>{s.picturesAnswered.toLocaleString()}</strong>
              <span> / {s.pictures.toLocaleString()} pictures answered</span>
            </div>
            <div
              className="admin-progress"
              role="progressbar"
              aria-label="Pictures answered"
              aria-valuenow={coverage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div style={{ width: `${coverage}%` }} />
            </div>
            <div className="admin-coverage-legend">
              <span>
                <i />
                Answered
              </span>
              <span>
                {Math.max(0, s.pictures - s.picturesAnswered).toLocaleString()}{" "}
                awaiting a first response
              </span>
            </div>
            <p className="admin-note">
              Responses are collected source data. These counts do not indicate
              linguistic verification or dataset readiness.
            </p>
          </div>
          <div className="admin-summary">
            <div>
              <strong>{s.uniqueWords}</strong>
              <span>Unique text responses</span>
            </div>
            <div>
              <strong>{s.campaignsLive}</strong>
              <span>Live campaigns</span>
            </div>
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Workspace actions</h2>
              <p>Keep collection and review moving.</p>
            </div>
          </div>
          {tasks
            .filter((t) => allowed(t.slug, role))
            .map((t) => (
              <div className="admin-task" key={t.slug}>
                <div>
                  <p>{t.title}</p>
                  <small>{t.detail}</small>
                </div>
                <Link className="admin-button" href={`/admin/${t.slug}`}>
                  {t.action}
                </Link>
              </div>
            ))}
        </section>
      </div>
      <p className="admin-note">
        Reference catalogue: {s.tribes.toLocaleString()} tribes ·{" "}
        {s.languages.toLocaleString()} languages. Reference review is separate
        from contribution quality review.
      </p>
    </>
  );
}

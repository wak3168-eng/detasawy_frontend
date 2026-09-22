"use client";
import Link from "next/link";
import { useState } from "react";
import type { DatasetGrouping, DatasetItem, DatasetResponse } from "@/lib/api";
import {
  ErrorNotice,
  Loading,
  Media,
  Pagination,
  Search,
  useAdminQuery,
} from "./AdminUI";

const groupingLabels: Record<DatasetGrouping, string> = {
  all: "All responses",
  country: "Country",
  province: "Province",
  district: "District",
  tehsil: "Tehsil",
  tribe: "Clan / tribe",
  clan: "Subgroup",
  subclan: "Subclan / branch",
};

const statusLabel = {
  representative: "Representative",
  mixed: "Mixed usage",
  insufficient: "Needs more data",
};

const percent = (value: number) => `${Math.round(value * 100)}%`;

export default function DatasetPanel() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [all, setAll] = useState(true);
  const [groupBy, setGroupBy] = useState<DatasetGrouping>("all");
  const [group, setGroup] = useState("");
  const [minimumSample, setMinimumSample] = useState(10);
  const [selected, setSelected] = useState<DatasetItem>();
  const query = new URLSearchParams({
    q,
    all: all ? "1" : "0",
    groupBy,
    minSample: String(minimumSample),
    limit: "20",
    offset: String((page - 1) * 20),
  });
  if (group) query.set("group", group);
  const { data, error, reload } = useAdminQuery<DatasetResponse>(
    `/api/admin/dataset?${query}`,
  );
  const reset = () => {
    setPage(1);
    setSelected(undefined);
  };
  const scope = data?.grouping.selectedLabel ?? groupingLabels[groupBy];

  return (
    <>
      <div className="admin-toolbar dataset-toolbar">
        <Search
          value={q}
          onChange={(value) => {
            setQ(value);
            reset();
          }}
          label="Search picture caption…"
        />
        <label className="dataset-filter">
          <span>Organize by</span>
          <select
            value={groupBy}
            onChange={(event) => {
              setGroupBy(event.target.value as DatasetGrouping);
              setGroup("");
              reset();
            }}
          >
            {Object.entries(groupingLabels).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
        {groupBy !== "all" && (
          <label className="dataset-filter">
            <span>{groupingLabels[groupBy]}</span>
            <select
              value={group}
              onChange={(event) => {
                setGroup(event.target.value);
                reset();
              }}
            >
              <option value="">All {groupingLabels[groupBy].toLowerCase()} groups</option>
              {data?.grouping.groups.map((item) => (
                <option value={item.key} key={item.key}>
                  {item.label} · {item.responses} responses
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="dataset-filter">
          <span>Minimum sample</span>
          <select
            value={minimumSample}
            onChange={(event) => {
              setMinimumSample(Number(event.target.value));
              reset();
            }}
          >
            <option value={5}>5 people</option>
            <option value={10}>10 people</option>
            <option value={20}>20 people</option>
            <option value={30}>30 people</option>
          </select>
        </label>
        <label className="dataset-filter">
          <span>Picture coverage</span>
          <select
            value={all ? "all" : "answered"}
            onChange={(event) => {
              setAll(event.target.value === "all");
              reset();
            }}
          >
            <option value="all">All pictures</option>
            <option value="answered">Pictures with responses</option>
          </select>
        </label>
      </div>

      <ErrorNotice message={error} retry={reload} />
      {!data && !error && <Loading />}

      {data && (
        <>
          <div className="admin-stats dataset-stats">
            {[
              ["Pictures", data.summary.pictures, `${data.summary.answeredPictures} answered`],
              ["Responses", data.summary.responses, scope],
              ["Recordings", data.summary.voices, "responses with audio"],
              ["Groups", data.grouping.groups.length || 1, groupingLabels[groupBy]],
            ].map(([label, value, note]) => (
              <div className="admin-stat" key={String(label)}>
                <p>{label}</p>
                <strong>{Number(value).toLocaleString()}</strong>
                <small>{note}</small>
              </div>
            ))}
          </div>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Pictures and community answers</h2>
                <p>{data.total.toLocaleString()} pictures in this view · {scope}</p>
              </div>
              <span className="admin-badge">
                Representative requires {data.representativeRules.minimumSample}+ people
              </span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table dataset-table">
                <thead>
                  <tr>
                    <th>Picture</th>
                    <th>Leading response</th>
                    <th>Responses</th>
                    <th>Audio</th>
                    <th>Alternatives</th>
                    <th><span className="sr-only">Inspect</span></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => {
                    const lead = item.representative;
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="admin-title-cell">
                            <Media kind={item.kind} url={item.mediaUrl} title={item.caption} />
                            <div>
                              <strong>{item.caption}</strong>
                              <small>{item.kind} · #{item.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          {lead ? (
                            <div className="dataset-lead">
                              <span dir="auto" className="admin-response">{lead.word}</span>
                              <span className={`admin-badge ${lead.status === "representative" ? "green" : lead.status === "mixed" ? "amber" : ""}`}>
                                {statusLabel[lead.status]}
                              </span>
                              <small>{percent(lead.share)} of {lead.sampleSize}</small>
                            </div>
                          ) : <span className="admin-badge">No answers</span>}
                        </td>
                        <td>{item.answers}</td>
                        <td>{item.voices}</td>
                        <td>{Math.max(0, item.words.length - 1)}</td>
                        <td>
                          <button
                            className="admin-button"
                            aria-expanded={selected?.id === item.id}
                            onClick={() => setSelected(selected?.id === item.id ? undefined : item)}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!data.items.length && <div className="admin-empty">No pictures match this dataset view.</div>}
            <Pagination
              page={page}
              total={data.total}
              onPage={(next) => {
                setPage(next);
                setSelected(undefined);
              }}
            />
          </section>
        </>
      )}

      {selected && (
        <section className="admin-panel admin-detail">
          <div className="admin-panel-heading dataset-detail-heading">
            <div className="admin-title-cell">
              <Media kind={selected.kind} url={selected.mediaUrl} title={selected.caption} />
              <div>
                <h2>{selected.caption}</h2>
                <p>Every grouped answer in {scope}</p>
              </div>
            </div>
            <button className="admin-button" onClick={() => setSelected(undefined)}>Close</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Response</th>
                  <th>Usage</th>
                  <th>People</th>
                  <th>Audio</th>
                  <th>Reported origins</th>
                </tr>
              </thead>
              <tbody>
                {selected.words.map((word, index) => (
                  <tr key={`${word.word}-${index}`}>
                    <td>
                      <span dir="auto" className="admin-response">{word.word}</span>
                      {word.variants?.length ? (
                        <small className="block text-ink-soft">
                          Spellings: {word.variants.map((variant) => `${variant.word} (${variant.count})`).join(", ")}
                        </small>
                      ) : null}
                    </td>
                    <td className="dataset-usage">
                      <div className="dataset-word-bar" aria-label={`${percent(word.share)} usage`}>
                        <span style={{ width: percent(word.share) }} />
                      </div>
                      <small>{percent(word.share)}</small>
                    </td>
                    <td>{word.count}</td>
                    <td>{word.voices ?? 0}</td>
                    <td>
                      {word.rows.slice(0, 3).map((place, rowIndex) => (
                        <small className="dataset-origin" key={rowIndex}>
                          {place.district} · {place.tribe}{place.clan ? ` / ${place.clan}` : ""} · {place.count}
                        </small>
                      ))}
                      {word.rows.length > 3 && <small>+{word.rows.length - 3} more</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!selected.words.length && <p className="admin-empty">This picture has no text responses in the selected group.</p>}
          <div className="admin-panel-heading">
            <p>{selected.answers} responses · {selected.voices} recordings</p>
            <Link className="admin-button primary" href={`/admin/contributions?prompt=${selected.id}`}>
              Open original records
            </Link>
          </div>
        </section>
      )}

      <p className="admin-note">
        Every picture and answer remains one source record. These country, district,
        clan and subclan views are statistical groupings. A leading response is
        marked representative only when its sample size, usage share and lead over
        alternatives pass the displayed thresholds.
      </p>
    </>
  );
}

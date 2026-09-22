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

type BrowseStage = "home" | "groups" | "items";

const groupingLabels: Record<DatasetGrouping, string> = {
  all: "All pictures",
  country: "Countries",
  province: "Provinces",
  district: "Districts",
  tehsil: "Tehsils",
  tribe: "Clans / tribes",
  clan: "Subgroups",
  subclan: "Subclans / branches",
};

const dimensionCards: Array<{
  value: Exclude<DatasetGrouping, "all">;
  number: string;
  description: string;
  family: "Geography" | "Community";
}> = [
  { value: "country", number: "01", description: "Compare names across Pakistan, Afghanistan and diaspora records.", family: "Geography" },
  { value: "province", number: "02", description: "Move from national patterns into provincial vocabulary.", family: "Geography" },
  { value: "district", number: "03", description: "See which names are most common inside each district.", family: "Geography" },
  { value: "tehsil", number: "04", description: "Inspect local variation at the most detailed geographic level.", family: "Geography" },
  { value: "tribe", number: "05", description: "Compare self-reported clan and tribe communities.", family: "Community" },
  { value: "clan", number: "06", description: "Browse the next level within a contributor's community path.", family: "Community" },
  { value: "subclan", number: "07", description: "Inspect self-reported subclan and branch variation.", family: "Community" },
];

const statusLabel = {
  representative: "Representative",
  mixed: "Mixed usage",
  insufficient: "Needs more data",
};

const percent = (value: number) => `${Math.round(value * 100)}%`;

function submittedNames(item: DatasetItem) {
  return item.words
    .flatMap((wordGroup) => {
      const variants = wordGroup.variants ?? [];
      const primaryCount = wordGroup.count - variants.reduce((sum, variant) => sum + variant.count, 0);
      return [
        { word: wordGroup.word, count: primaryCount },
        ...variants.map((variant) => ({ word: variant.word, count: variant.count })),
      ];
    })
    .filter((name) => name.word && name.count > 0)
    .sort((left, right) => right.count - left.count || left.word.localeCompare(right.word));
}

export default function DatasetPanel() {
  const [stage, setStage] = useState<BrowseStage>("home");
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
  const { data, error, reload } = useAdminQuery<DatasetResponse>(`/api/admin/dataset?${query}`);

  const resetItems = () => {
    setPage(1);
    setSelected(undefined);
  };
  const openHome = () => {
    setStage("home");
    setGroupBy("all");
    setGroup("");
    setQ("");
    resetItems();
  };
  const openDimension = (dimension: Exclude<DatasetGrouping, "all">) => {
    setGroupBy(dimension);
    setGroup("");
    setQ("");
    setStage("groups");
    resetItems();
  };
  const openAllPictures = () => {
    setGroupBy("all");
    setGroup("");
    setStage("items");
    resetItems();
  };
  const openGroup = (key: string) => {
    setGroup(key);
    setStage("items");
    resetItems();
  };
  const scope = data?.grouping.selectedLabel ?? groupingLabels[groupBy];

  return (
    <>
      {stage !== "home" && (
        <nav className="dataset-breadcrumb" aria-label="Dataset navigation">
          <button type="button" onClick={openHome}>Datasets</button>
          <span>/</span>
          {stage === "items" && groupBy !== "all" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setGroup("");
                  setStage("groups");
                  resetItems();
                }}
              >
                {groupingLabels[groupBy]}
              </button>
              <span>/</span>
              <strong>{scope}</strong>
            </>
          ) : <strong>{groupingLabels[groupBy]}</strong>}
        </nav>
      )}

      <ErrorNotice message={error} retry={reload} />

      {stage === "home" && (
        <div className="dataset-home">
          <section className="dataset-home-intro">
            <div>
              <p className="admin-eyebrow">DATASET LIBRARY</p>
              <h2>Choose how you want to explore the collection</h2>
              <p>
                Every view uses the same pictures and original answers. The cards
                reorganize those records without making duplicate datasets.
              </p>
            </div>
            <button className="dataset-all-card" type="button" onClick={openAllPictures}>
              <span>Complete collection</span>
              <strong>{data?.summary.pictures.toLocaleString() ?? "—"} pictures</strong>
              <small>{data?.summary.responses.toLocaleString() ?? "—"} submitted answers</small>
              <b>Open all pictures →</b>
            </button>
          </section>

          {(["Geography", "Community"] as const).map((family) => (
            <section className="dataset-dimension-section" key={family}>
              <div className="dataset-section-heading">
                <div>
                  <h2>Browse by {family.toLowerCase()}</h2>
                  <p>{family === "Geography" ? "Start broad, then move into local speech." : "Use only self-reported community information."}</p>
                </div>
              </div>
              <div className="dataset-navigation-grid">
                {dimensionCards.filter((card) => card.family === family).map((card) => (
                  <button
                    type="button"
                    className="dataset-nav-card"
                    onClick={() => openDimension(card.value)}
                    key={card.value}
                  >
                    <span>{card.number}</span>
                    <h3>{groupingLabels[card.value]}</h3>
                    <p>{card.description}</p>
                    <b>Browse {groupingLabels[card.value].toLowerCase()} →</b>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {stage === "groups" && !data && !error && <Loading />}
      {stage === "groups" && data && (
        <section className="admin-panel dataset-group-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">{groupBy === "country" || groupBy === "province" || groupBy === "district" || groupBy === "tehsil" ? "GEOGRAPHIC DATASETS" : "COMMUNITY DATASETS"}</p>
              <h2>{groupingLabels[groupBy]}</h2>
              <p>Select one group to see its pictures, most common names and every alternative.</p>
            </div>
            <span className="admin-badge">{data.grouping.groups.length} available</span>
          </div>
          <div className="dataset-group-grid">
            {data.grouping.groups.map((item) => (
              <button className="dataset-group-card" type="button" onClick={() => openGroup(item.key)} key={item.key}>
                <span className="dataset-group-mark">{item.label.slice(0, 2).toUpperCase()}</span>
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.pictures.toLocaleString()} answered pictures</p>
                </div>
                <dl>
                  <div><dt>Responses</dt><dd>{item.responses.toLocaleString()}</dd></div>
                  <div><dt>Recordings</dt><dd>{item.voices.toLocaleString()}</dd></div>
                </dl>
                <b>Open dataset →</b>
              </button>
            ))}
          </div>
          {!data.grouping.groups.length && (
            <div className="admin-empty">No contributions currently contain this level of information.</div>
          )}
        </section>
      )}

      {stage === "items" && (
        <>
          <div className="admin-toolbar dataset-toolbar">
            <Search
              value={q}
              onChange={(value) => {
                setQ(value);
                resetItems();
              }}
              label="Search picture caption…"
            />
            <label className="dataset-filter">
              <span>Minimum sample</span>
              <select
                value={minimumSample}
                onChange={(event) => {
                  setMinimumSample(Number(event.target.value));
                  resetItems();
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
                  resetItems();
                }}
              >
                <option value="all">All pictures</option>
                <option value="answered">Pictures with responses</option>
              </select>
            </label>
          </div>

          {!data && !error && <Loading />}
          {data && (
            <>
              <div className="admin-stats dataset-stats">
                {[
                  ["Pictures", data.summary.pictures, `${data.summary.answeredPictures} answered`],
                  ["Responses", data.summary.responses, scope],
                  ["Recordings", data.summary.voices, "responses with audio"],
                  ["Evidence rule", data.representativeRules.minimumSample, "minimum people"],
                ].map(([label, value, note]) => (
                  <div className="admin-stat" key={String(label)}>
                    <p>{label}</p>
                    <strong>{Number(value).toLocaleString()}</strong>
                    <small>{note}</small>
                  </div>
                ))}
              </div>

              <section className="admin-panel dataset-picture-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>{scope}</h2>
                    <p>Most common name first, followed by every other submitted name.</p>
                  </div>
                  <span className="admin-badge">{data.total.toLocaleString()} pictures</span>
                </div>
                <div className="dataset-picture-grid">
                  {data.items.map((item) => {
                    const lead = item.representative;
                    const otherNames = submittedNames(item).filter((name) => name.word !== lead?.word);
                    return (
                      <article className="dataset-picture-card" key={item.id}>
                        <div className="dataset-picture-frame">
                          <Media kind={item.kind} url={item.mediaUrl} title={item.caption} />
                          <span>{item.kind} · #{item.id}</span>
                        </div>
                        <div className="dataset-picture-body">
                          <header>
                            <div>
                              <small>{scope}</small>
                              <h3>{item.caption}</h3>
                            </div>
                            <span className={`admin-badge ${lead?.status === "representative" ? "green" : lead?.status === "mixed" ? "amber" : ""}`}>
                              {lead ? statusLabel[lead.status] : "No answers"}
                            </span>
                          </header>
                          {lead ? (
                            <div className="dataset-primary-name">
                              <span>Most common name</span>
                              <strong dir="auto">{lead.word}</strong>
                              <div>
                                <div className="dataset-word-bar" aria-label={`${percent(lead.share)} usage`}>
                                  <span style={{ width: percent(lead.share) }} />
                                </div>
                                <small>{percent(lead.share)} · {lead.count} of {lead.sampleSize} people</small>
                              </div>
                            </div>
                          ) : <p className="dataset-no-answer">Waiting for the first community answer.</p>}
                          <div className="dataset-name-list">
                            <span>Other names</span>
                            {otherNames.length ? (
                              <div className="dataset-other-names">
                                {otherNames.map((name) => (
                                  <span dir="auto" key={name.word}>{name.word} <small>{name.count}</small></span>
                                ))}
                              </div>
                            ) : <small>None submitted yet</small>}
                          </div>
                        </div>
                        <footer>
                          <span>{item.answers} responses</span>
                          <span>{item.voices} recordings</span>
                          <button
                            className="admin-button"
                            aria-expanded={selected?.id === item.id}
                            onClick={() => setSelected(selected?.id === item.id ? undefined : item)}
                          >
                            Inspect names
                          </button>
                        </footer>
                      </article>
                    );
                  })}
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
        </>
      )}

      {stage === "items" && selected && (
        <section className="admin-panel admin-detail">
          <div className="admin-panel-heading dataset-detail-heading">
            <div className="admin-title-cell">
              <Media kind={selected.kind} url={selected.mediaUrl} title={selected.caption} />
              <div>
                <h2>{selected.caption}</h2>
                <p>Every submitted name in {scope}</p>
              </div>
            </div>
            <button className="admin-button" onClick={() => setSelected(undefined)}>Close</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Usage</th><th>People</th><th>Audio</th><th>Reported origins</th></tr></thead>
              <tbody>
                {selected.words.map((wordGroup, index) => (
                  <tr key={`${wordGroup.word}-${index}`}>
                    <td>
                      <span dir="auto" className="admin-response">{wordGroup.word}</span>
                      {wordGroup.variants?.length ? (
                        <small className="block text-ink-soft">
                          Spellings: {wordGroup.variants.map((variant) => `${variant.word} (${variant.count})`).join(", ")}
                        </small>
                      ) : null}
                    </td>
                    <td className="dataset-usage">
                      <div className="dataset-word-bar" aria-label={`${percent(wordGroup.share)} usage`}>
                        <span style={{ width: percent(wordGroup.share) }} />
                      </div>
                      <small>{percent(wordGroup.share)}</small>
                    </td>
                    <td>{wordGroup.count}</td>
                    <td>{wordGroup.voices ?? 0}</td>
                    <td>
                      {wordGroup.rows.map((place, rowIndex) => (
                        <small className="dataset-origin" key={rowIndex}>
                          {place.district} · {place.tribe}{place.clan ? ` / ${place.clan}` : ""} · {place.count}
                        </small>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!selected.words.length && <p className="admin-empty">This picture has no text responses in the selected group.</p>}
          <div className="admin-panel-heading">
            <p>{selected.answers} responses · {selected.voices} recordings</p>
            <Link className="admin-button primary" href={`/admin/contributions?prompt=${selected.id}`}>Open original records</Link>
          </div>
        </section>
      )}

      <p className="admin-note">
        Country, district and clan datasets are browse views over the same source
        records. Identifying the most common name never removes other names or spellings.
      </p>
    </>
  );
}

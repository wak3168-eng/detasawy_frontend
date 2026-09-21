"use client";
import Link from "next/link";
import { useState } from "react";
import type { DatasetItem } from "@/lib/api";
import {
  ErrorNotice,
  Loading,
  Media,
  Pagination,
  Search,
  useAdminQuery,
} from "./AdminUI";
export default function DatasetPanel() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const [selected, setSelected] = useState<DatasetItem>();
  const query = new URLSearchParams({
    q,
    all: all ? "1" : "0",
    limit: "20",
    offset: String((page - 1) * 20),
  });
  const { data, error, reload } = useAdminQuery<{
    items: DatasetItem[];
    total: number;
  }>(`/api/admin/dataset?${query}`);
  const reset = () => {
    setPage(1);
    setSelected(undefined);
  };
  return (
    <>
      <div className="admin-toolbar">
        <Search
          value={q}
          onChange={(v) => {
            setQ(v);
            reset();
          }}
          label="Search prompt caption…"
        />
        <select
          aria-label="Dataset coverage"
          value={all ? "all" : "answered"}
          onChange={(e) => {
            setAll(e.target.value === "all");
            reset();
          }}
        >
          <option value="answered">Answered prompts</option>
          <option value="all">All prompts</option>
        </select>
      </div>
      <ErrorNotice message={error} retry={reload} />
      {!data && !error && <Loading />}
      {data && (
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Response coverage by prompt</h2>
              <p>
                {data.total.toLocaleString()} matching prompts · most answered
                first
              </p>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Prompt</th>
                  <th>Responses</th>
                  <th>Audio</th>
                  <th>Text groups</th>
                  <th>
                    <span className="sr-only">Inspect</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="admin-title-cell">
                        <Media
                          kind={item.kind}
                          url={item.mediaUrl}
                          title={item.caption}
                        />
                        <div>
                          <strong>{item.caption}</strong>
                          <small>
                            {item.kind} · #{item.id}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>{item.answers}</td>
                    <td>{item.voices}</td>
                    <td>{item.words.length}</td>
                    <td>
                      <button
                        className="admin-button"
                        aria-expanded={selected?.id === item.id}
                        onClick={() =>
                          setSelected(
                            selected?.id === item.id ? undefined : item,
                          )
                        }
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.items.length && (
            <div className="admin-empty">
              No prompts match this view. Try all prompts or a different search.
            </div>
          )}
          <Pagination
            page={page}
            total={data.total}
            onPage={(p) => {
              setPage(p);
              setSelected(undefined);
            }}
          />
        </section>
      )}
      {selected && (
        <section className="admin-panel admin-detail">
          <div className="admin-panel-heading">
            <div>
              <h2>{selected.caption}</h2>
              <p>Grouped text responses and their reported origin</p>
            </div>
            <button
              className="admin-button"
              onClick={() => setSelected(undefined)}
            >
              Close
            </button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Response</th>
                  <th>District</th>
                  <th>Tribe / clan</th>
                  <th>People</th>
                  <th>Audio</th>
                </tr>
              </thead>
              <tbody>
                {selected.words.flatMap((word, wi) =>
                  word.rows.map((place, pi) => (
                    <tr key={`${wi}-${pi}`}>
                      <td>
                        <span dir="auto" className="admin-response">
                          {word.word || "Audio only"}
                        </span>
                        {word.variants?.length ? (
                          <small className="block text-ink-soft">
                            Variants:{" "}
                            {word.variants.map((v) => v.word).join(", ")}
                          </small>
                        ) : null}
                      </td>
                      <td>{place.district}</td>
                      <td>
                        {place.tribe}
                        {place.clan ? ` / ${place.clan}` : ""}
                      </td>
                      <td>{place.count}</td>
                      <td>{place.voices}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
          {!selected.words.length && (
            <p className="admin-empty">
              No text groups available. Open original records to inspect
              audio-only contributions.
            </p>
          )}
          <div className="admin-panel-heading">
            <p>
              {selected.answers} responses · {selected.voices} recordings
            </p>
            <Link
              className="admin-button primary"
              href={`/admin/contributions?prompt=${selected.id}`}
            >
              Open original records
            </Link>
          </div>
        </section>
      )}
      <p className="admin-note">
        Text groups are automatic aggregations, not verified dictionary entries.
        Original contribution records preserve the submitted text and available
        audio.
      </p>
    </>
  );
}

"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  date,
  ErrorNotice,
  Loading,
  Media,
  Pagination,
  Search,
  useAdminQuery,
  type PageResult,
} from "./AdminUI";
type RecordRow = {
  id: number;
  promptId: number;
  caption: string;
  kind: string;
  mediaUrl: string;
  text: string;
  audioUrl: string | null;
  district: string | null;
  createdAt: string;
  updatedAt: string;
};
export default function Contributions() {
  const params = useSearchParams();
  const prompt = params.get("prompt") ?? "";
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [audio, setAudio] = useState("");
  const [kind, setKind] = useState("");
  const query = new URLSearchParams({ page: String(page), q });
  if (audio) query.set("audio", audio);
  if (kind) query.set("kind", kind);
  if (prompt) query.set("prompt", prompt);
  const { data, error, reload } = useAdminQuery<PageResult<RecordRow>>(
    `/api/admin/contributions?${query}`,
  );
  return (
    <>
      {prompt && (
        <p className="admin-note">
          Showing prompt #{prompt}.{" "}
          <Link href="/admin/contributions" onClick={() => setPage(1)}>
            View all contributions
          </Link>
        </p>
      )}
      <div className="admin-toolbar">
        <Search
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          label="Search response or prompt…"
        />
        <select
          aria-label="Recording filter"
          value={audio}
          onChange={(e) => {
            setAudio(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All recording states</option>
          <option value="yes">With audio</option>
          <option value="no">Without audio</option>
        </select>
        <select
          aria-label="Prompt type"
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All prompt types</option>
          <option value="picture">Picture</option>
          <option value="scene">Scene</option>
          <option value="voice">Voice</option>
        </select>
      </div>
      <ErrorNotice message={error} retry={reload} />
      {!data && !error && <Loading />}
      {data && (
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Source contributions</h2>
              <p>
                {data.total.toLocaleString()} matching records · latest updated
                first
              </p>
            </div>
            <span className="admin-badge amber">Unreviewed data</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table admin-record-table">
              <thead>
                <tr>
                  <th>Prompt</th>
                  <th>Response</th>
                  <th>Recording</th>
                  <th>District</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="admin-title-cell">
                        <Media
                          kind={row.kind}
                          url={row.mediaUrl}
                          title={row.caption}
                        />
                        <div>
                          <strong>{row.caption}</strong>
                          <small>
                            {row.kind} · record #{row.id}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Response">
                      <span dir="auto" className="admin-response">
                        {row.text || "No text submitted"}
                      </span>
                    </td>
                    <td data-label="Recording">
                      {row.audioUrl ? (
                        <audio
                          controls
                          preload="none"
                          src={row.audioUrl}
                          aria-label={`Recording for ${row.caption}, record ${row.id}`}
                          className="admin-audio"
                        />
                      ) : (
                        <span className="admin-badge">No audio recorded</span>
                      )}
                    </td>
                    <td data-label="District">
                      {row.district || "Not provided"}
                    </td>
                    <td data-label="Updated" className="whitespace-nowrap">
                      {date(row.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.items.length && (
            <div className="admin-empty">
              No contributions match these filters.
            </div>
          )}
          <Pagination page={page} total={data.total} onPage={setPage} />
        </section>
      )}
      <p className="admin-note">
        An absent recording stays marked as missing. Audio availability does not
        imply that its contents have been verified.
      </p>
    </>
  );
}

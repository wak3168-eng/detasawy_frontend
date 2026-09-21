"use client";
import { useRef, useState } from "react";
import {
  linkPrompt,
  uploadPromptFolder,
  setPromptActive,
  uploadPrompt,
  type StaffPrompt,
} from "@/lib/api";
import {
  ErrorNotice,
  Loading,
  Media,
  Pagination,
  Search,
  useAdminQuery,
  type PageResult,
} from "./AdminUI";
export default function PromptManager() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [filterKind, setFilterKind] = useState("");
  const [active, setActive] = useState("");
  const query = new URLSearchParams({ q, page: String(page) });
  if (filterKind) query.set("kind", filterKind);
  if (active) query.set("active", active);
  const {
    data,
    error: loadError,
    reload,
  } = useAdminQuery<PageResult<StaffPrompt>>(`/api/admin/prompts?${query}`);
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<StaffPrompt["kind"]>("picture");
  const [source, setSource] = useState("file");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [licence, setLicence] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [captionPs, setCaptionPs] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [failures, setFailures] = useState<{ name: string; why: string }[]>([]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    setFailures([]);
    try {
      const metadata = { kind, captionEn, captionPs, sourceUrl, licence };
      if (source === "folder") {
        const files = Array.from(fileRef.current?.files ?? []);
        if (!files.length) throw new Error("Select a folder first.");
        const result = await uploadPromptFolder(kind, files);
        setNotice(
          `${result.createdCount} added · ${result.skipped.length} duplicate captions skipped · ${result.failed.length} failed.`,
        );
        setFailures(result.failed);
      } else {
        if (source === "file") {
          const media = fileRef.current?.files?.[0];
          if (!media) throw new Error("Select a media file first.");
          await uploadPrompt({ ...metadata, media });
        } else await linkPrompt({ ...metadata, mediaUrl });
        setNotice("Prompt added to the library.");
        setCaptionEn("");
        setCaptionPs("");
        setMediaUrl("");
        setSourceUrl("");
        setLicence("");
      }
      if (fileRef.current) fileRef.current.value = "";
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the prompt.");
    } finally {
      setBusy(false);
    }
  }
  async function toggle(row: StaffPrompt) {
    setPending(row.id);
    setError("");
    setNotice("");
    try {
      await setPromptActive(row.id, !row.active);
      setNotice(`Prompt #${row.id} ${row.active ? "paused" : "activated"}.`);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update the prompt.");
    } finally {
      setPending(null);
    }
  }
  return (
    <>
      <div className="admin-toolbar">
        <Search
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          label="Search English or Pashto caption…"
        />
        <button
          className="admin-button primary"
          aria-expanded={adding}
          onClick={() => setAdding(!adding)}
          disabled={busy}
        >
          {adding ? "Close form" : "+ Add prompts"}
        </button>
      </div>
      <ErrorNotice message={error} />
      {notice && (
        <div className="admin-success" role="status">
          {notice}
        </div>
      )}
      {failures.length > 0 && (
        <details className="admin-note">
          <summary>View failed files ({failures.length})</summary>
          <ul>
            {failures.map((f, i) => (
              <li key={i}>
                {f.name}: {f.why}
              </li>
            ))}
          </ul>
        </details>
      )}
      {adding && (
        <section className="admin-panel mb-6">
          <div className="admin-panel-heading">
            <div>
              <h2>Add to the library</h2>
              <p>Pictures and scenes use images. Voice prompts use audio.</p>
            </div>
          </div>
          <form className="admin-form" onSubmit={save}>
            <fieldset disabled={busy} className="contents">
              <div className="admin-form-grid">
                <label>
                  Prompt type
                  <select
                    value={kind}
                    onChange={(e) =>
                      setKind(e.target.value as StaffPrompt["kind"])
                    }
                  >
                    <option value="picture">Picture naming</option>
                    <option value="scene">Scene description</option>
                    <option value="voice">Voice prompt</option>
                  </select>
                </label>
                <label>
                  Media source
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  >
                    <option value="file">Upload one file</option>
                    <option value="folder">Upload a folder</option>
                    <option value="link">External media URL</option>
                  </select>
                </label>
              </div>
              {source === "link" ? (
                <label>
                  Media URL
                  <input
                    required
                    type="url"
                    maxLength={500}
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </label>
              ) : (
                <label>
                  {source === "folder" ? "Choose folder" : "Choose file"}
                  <input
                    key={source + kind}
                    ref={fileRef}
                    type="file"
                    required
                    accept={kind === "voice" ? "audio/*" : "image/*"}
                    multiple={source === "folder"}
                    {...(source === "folder" ? { webkitdirectory: "" } : {})}
                  />
                  <small>
                    {source === "folder"
                      ? "Filenames become captions. Existing captions of the same prompt type are skipped. Review the upload result for failed files."
                      : "Maximum 20 MB per file."}
                  </small>
                </label>
              )}
              {source !== "folder" && (
                <>
                  <div className="admin-form-grid">
                    <label>
                      English caption
                      <input
                        maxLength={160}
                        value={captionEn}
                        onChange={(e) => setCaptionEn(e.target.value)}
                        placeholder="e.g. Wooden door"
                      />
                    </label>
                    <label>
                      Pashto caption <small>Optional</small>
                      <input
                        maxLength={160}
                        dir="rtl"
                        lang="ps"
                        value={captionPs}
                        onChange={(e) => setCaptionPs(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="admin-form-grid">
                    <label>
                      Source page <small>Optional</small>
                      <input
                        type="url"
                        maxLength={500}
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://…"
                      />
                    </label>
                    <label>
                      Licence <small>Optional</small>
                      <input
                        maxLength={200}
                        value={licence}
                        onChange={(e) => setLicence(e.target.value)}
                        placeholder="e.g. CC BY 4.0"
                      />
                    </label>
                  </div>
                </>
              )}
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-button"
                  onClick={() => setAdding(false)}
                >
                  Cancel
                </button>
                <button className="admin-button primary" type="submit">
                  {busy ? "Saving…" : "Save prompts"}
                </button>
              </div>
            </fieldset>
          </form>
        </section>
      )}
      <div className="admin-toolbar">
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filter prompt type"
            value={filterKind}
            onChange={(e) => {
              setFilterKind(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All types</option>
            <option value="picture">Pictures</option>
            <option value="scene">Scenes</option>
            <option value="voice">Voice</option>
          </select>
          <select
            aria-label="Filter prompt status"
            value={active}
            onChange={(e) => {
              setActive(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Paused</option>
          </select>
        </div>
        <span className="admin-note">
          Active prompts can be served to contributors.
        </span>
      </div>
      <ErrorNotice message={loadError} retry={reload} />
      {!data && !loadError && <Loading />}
      {data && (
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Prompt library</h2>
              <p>
                {data.total.toLocaleString()} matching prompts · newest first
              </p>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Prompt</th>
                  <th>Status</th>
                  <th>Responses</th>
                  <th className="admin-hide-mobile">Served</th>
                  <th className="admin-hide-mobile">Licence</th>
                  <th>Action</th>
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
                          title={row.captionEn || `Prompt ${row.id}`}
                        />
                        <div>
                          <strong>
                            {row.captionEn ||
                              row.captionPs ||
                              `Prompt ${row.id}`}
                          </strong>
                          <small>
                            {row.kind} · #{row.id}
                          </small>
                          {row.captionPs && (
                            <span lang="ps" dir="rtl">
                              {row.captionPs}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${row.active ? "green" : ""}`}
                      >
                        {row.active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td>{row.answers ?? 0}</td>
                    <td className="admin-hide-mobile">{row.servedCount}</td>
                    <td className="admin-hide-mobile">
                      {row.licence || "Not specified"}
                    </td>
                    <td>
                      <button
                        className="admin-button"
                        disabled={pending !== null}
                        aria-label={`${row.active ? "Pause" : "Activate"} prompt ${row.id}`}
                        onClick={() => toggle(row)}
                      >
                        {pending === row.id
                          ? "Saving…"
                          : row.active
                            ? "Pause"
                            : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.items.length && (
            <div className="admin-empty">No prompts match these filters.</div>
          )}
          <Pagination page={page} total={data.total} onPage={setPage} />
        </section>
      )}
    </>
  );
}

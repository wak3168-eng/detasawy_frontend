"use client";
import { useEffect, useState } from "react";
import { request } from "@/lib/api";

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
export function useAdminQuery<T>(url: string) {
  const [revision, setRevision] = useState(0);
  const identity = `${url}:${revision}`;
  const [result, setResult] = useState<{
    url: string;
    identity: string;
    data?: T;
    error?: string;
  }>();
  useEffect(() => {
    let alive = true;
    request<T>(url, {}, true).then(
      (data) => {
        if (alive) setResult({ url, identity, data });
      },
      (error) => {
        if (alive)
          setResult((previous) => ({
            url,
            identity,
            data: previous?.url === url ? previous.data : undefined,
            error:
              error instanceof Error
                ? error.message
                : "Could not load this page.",
          }));
      },
    );
    return () => {
      alive = false;
    };
  }, [url, identity]);
  return {
    // Keep the current view mounted during a refresh, but never show another
    // search or page's results while its request is loading.
    data: result?.url === url ? result.data : undefined,
    error: result?.identity === identity ? result.error : undefined,
    loading: result?.identity !== identity,
    reload: () => setRevision((n) => n + 1),
    updateData: (update: (data: T) => T) => setResult((previous) =>
      previous?.identity === identity && previous.data !== undefined
        ? { ...previous, data: update(previous.data) }
        : previous,
    ),
  };
}
export function ErrorNotice({
  message,
  retry,
}: {
  message?: string | null;
  retry?: () => void;
}) {
  if (!message) return null;
  return (
    <div className="admin-error" role="alert">
      {message}
      {retry && <button type="button" onClick={retry}>Try again</button>}
    </div>
  );
}
export function Loading() {
  return (
    <div className="admin-empty" role="status">
      Loading workspace…
    </div>
  );
}
export function Pagination({
  page,
  total,
  size = 20,
  onPage,
}: {
  page: number;
  total: number;
  size?: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="admin-pagination">
      <span>
        {total && (page - 1) * size < total
          ? `${(page - 1) * size + 1}–${Math.min(page * size, total)} of ${total}`
          : total ? "No results on this page" : "0 results"}
      </span>
      <div>
        <button
          className="admin-button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </button>
        <button
          className="admin-button"
          disabled={page * size >= total}
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
export function Search({
  value,
  onChange,
  label = "Search",
}: {
  value: string;
  onChange: (s: string) => void;
  label?: string;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <form
      className="admin-search"
      onSubmit={(e) => {
        e.preventDefault();
        onChange(draft.trim());
      }}
    >
      <label className="sr-only" htmlFor="admin-search">
        {label}
      </label>
      <input
        id="admin-search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={label}
      />
      <button className="admin-button" type="submit">
        Search
      </button>
    </form>
  );
}
export function Media({
  kind,
  url,
  title,
}: {
  kind: string;
  url: string;
  title: string;
}) {
  return kind === "voice" ? (
    <audio
      controls
      preload="none"
      src={url}
      aria-label={title}
      className="admin-audio"
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={title} loading="lazy" className="admin-thumbnail" />
  );
}
export const date = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

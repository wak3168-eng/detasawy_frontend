"use client";
import { useState } from "react";
import {
  createUser,
  setUserRole,
  type AdminUser,
  type CreatedUser,
} from "@/lib/api";
import {
  date,
  ErrorNotice,
  Loading,
  Pagination,
  Search,
  useAdminQuery,
  type PageResult,
} from "./AdminUI";
const roles = [
  { value: "contributor", label: "Contributor" },
  { value: "reviewer", label: "Reviewer" },
  { value: "campaign", label: "Campaign manager" },
] as const;
function Person({ user, onChange }: { user: AdminUser; onChange: () => void }) {
  const [role, setRole] = useState(user.role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (role === "superadmin") return;
    setBusy(true);
    setError("");
    try {
      await setUserRole(user.email, role);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change access.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <tr>
      <td>
        <strong>{user.name || "Unnamed account"}</strong>
        <small className="block text-ink-soft">{user.email}</small>
        {error && <ErrorNotice message={error} />}
      </td>
      <td>
        {user.role === "superadmin" ? (
          <span className="admin-badge">Superadmin · protected</span>
        ) : (
          <select
            aria-label={`Role for ${user.email}`}
            disabled={busy}
            value={role}
            onChange={(e) => setRole(e.target.value as AdminUser["role"])}
          >
            {roles.map((r) => (
              <option value={r.value} key={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        )}
      </td>
      <td>
        <span className={`admin-badge ${user.profileComplete ? "green" : ""}`}>
          {user.profileComplete ? "Complete" : "Incomplete"}
        </span>
      </td>
      <td className="admin-hide-mobile">{date(user.joined)}</td>
      <td>
        {role !== user.role && (
          <div className="flex gap-2">
            <button
              className="admin-button primary"
              disabled={busy}
              onClick={save}
            >
              {busy ? "Saving…" : "Save role"}
            </button>
            <button
              className="admin-button"
              disabled={busy}
              onClick={() => setRole(user.role)}
            >
              Cancel
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
export default function TeamManager() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, error, reload } = useAdminQuery<PageResult<AdminUser>>(
    `/api/admin/users?page=${page}&q=${encodeURIComponent(q)}`,
  );
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [created, setCreated] = useState<CreatedUser>();
  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    try {
      setCreated(await createUser({ name: name.trim(), email: email.trim() }));
      setName("");
      setEmail("");
      setAdding(false);
      reload();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Could not create the account.",
      );
    } finally {
      setBusy(false);
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
          label="Search name or email…"
        />
        <button
          className="admin-button primary"
          disabled={busy}
          onClick={() => setAdding(!adding)}
          aria-expanded={adding}
        >
          + Create account
        </button>
      </div>
      {created && (
        <section className="admin-panel mb-6">
          <div className="admin-form">
            <h2 className="font-bold">Account created for {created.name}</h2>
            <p>{created.email}</p>
            <label>
              Starting password{" "}
              <code className="select-all">{created.startingPassword}</code>
            </label>
            <p className="admin-note">
              This password is shown once. Share it privately with the account
              owner.
            </p>
            <button
              className="admin-button"
              onClick={() => setCreated(undefined)}
            >
              Dismiss password
            </button>
          </div>
        </section>
      )}
      {adding && (
        <section className="admin-panel mb-6">
          <div className="admin-panel-heading">
            <div>
              <h2>Create a contributor account</h2>
              <p>You can assign reviewer or campaign access after creation.</p>
            </div>
          </div>
          <form className="admin-form" onSubmit={create}>
            <div className="admin-form-grid">
              <label>
                Full name
                <input
                  required
                  maxLength={120}
                  value={name}
                  disabled={busy}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <label>
                Email address
                <input
                  required
                  type="email"
                  value={email}
                  disabled={busy}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                />
              </label>
            </div>
            <ErrorNotice message={formError} />
            <div className="admin-form-actions">
              <button
                className="admin-button"
                type="button"
                disabled={busy}
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>
              <button className="admin-button primary" disabled={busy}>
                {busy ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>
        </section>
      )}
      <ErrorNotice message={error} retry={reload} />
      {!data && !error && <Loading />}
      {data && (
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>People and permissions</h2>
              <p>{data.total} matching accounts · role changes require Save</p>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Role</th>
                  <th>Profile</th>
                  <th className="admin-hide-mobile">Joined</th>
                  <th>
                    <span className="sr-only">Save changes</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((user) => (
                  <Person
                    key={user.email + user.role}
                    user={user}
                    onChange={reload}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {!data.items.length && (
            <div className="admin-empty">No accounts match this search.</div>
          )}
          <Pagination page={page} total={data.total} onPage={setPage} />
        </section>
      )}
      <p className="admin-note">
        Reviewers manage reference suggestions. Campaign managers manage prompts
        and campaigns. Superadmins also access contributions, datasets, and
        accounts.
      </p>
    </>
  );
}

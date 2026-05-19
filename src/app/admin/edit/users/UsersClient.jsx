"use client";

import { Eye, EyeOff, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { getAdminRoleBadgeLabel } from "@/lib/admin-role";
import {
  generateRandomPassword,
  PASSWORD_HELPER_TEXT,
  USERNAME_HELPER_TEXT,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
  validatePassword,
} from "@/lib/account-validation";
import { validateApplicationStyleEmail } from "@/lib/email-validation";

function createInitialNewUser() {
  return { name: "", email: "", password: generateRandomPassword(), role: "" };
}

function roleBadgeClasses(role) {
  return role === "admin"
    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
    : "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
}

export default function UsersClient({ initialUserName, initialRole }) {
  const isSuperAdminSession = initialRole === "super_admin";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [newUser, setNewUser] = useState(() => createInitialNewUser());
  const [saving, setSaving] = useState(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Error loading users.");
        }

        const json = await res.json();
        if (ignore) return;

        setUsers(json);
        setMessage("");
      } catch {
        if (!ignore) setMessage("Error loading users.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchUsers();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this user?")) return;

    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setMessage("User removed.");
      return;
    }

    try {
      const err = await res.json();
      setMessage(err?.error || "Error removing user.");
    } catch {
      setMessage("Error removing user.");
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setMessage("");

    const emailError = validateApplicationStyleEmail(newUser.email);
    if (emailError) {
      setMessage(emailError);
      return;
    }

    const usernameError = validateUsername(newUser.name);
    if (usernameError) {
      setMessage(usernameError);
      return;
    }

    const passwordError = validatePassword(newUser.password);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    if (!newUser.role) {
      setMessage("Select a role.");
      return;
    }

    setSaving(true);
    try {
      const temporaryPassword = newUser.password;
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        const created = await res.json();
        setUsers((prev) => [...prev, created]);
        setNewUser(createInitialNewUser());
        setMessage(`User created. Temporary password: ${temporaryPassword}. The user can change or reset it later.`);
      } else {
        const errorJson = await res.json().catch(() => ({}));
        if (errorJson?.error === "Email already exists") {
          setMessage("This Email is already in use.");
        } else {
          setMessage(errorJson?.error || "Error creating user.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Users" userName={initialUserName} role={initialRole}>
      <div className="space-y-6">
        {message ? (
          <div className="rounded-2xl border border-[#d6dfeb] bg-white px-4 py-3 text-sm font-medium text-[#1d4f9d] shadow-sm">
            {message}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[26px] border border-[#cfd7e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <div className="border-b border-[#dde5ef] bg-[#f3f5f8] px-6 py-3 text-center text-sm font-semibold text-slate-700">
            Add New User
          </div>

          <form onSubmit={handleCreateUser} className="space-y-6 px-6 py-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[18px] font-bold leading-none text-[#164896]">Username</span>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-lg border border-[#aeb9c8] bg-[#f8f8f8] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#164896]"
                  placeholder="Enter username"
                  required
                  minLength={USERNAME_MIN_LENGTH}
                  maxLength={USERNAME_MAX_LENGTH}
                  pattern={USERNAME_PATTERN}
                />
                <p className="mt-2 text-xs text-slate-500">{USERNAME_HELPER_TEXT}</p>
              </label>

              <label className="block">
                <span className="mb-2 block text-[18px] font-bold leading-none text-[#164896]">Temporary Password</span>
                <div className="relative">
                  <input
                    type={showNewUserPassword ? "text" : "password"}
                    value={newUser.password}
                    className="w-full rounded-lg border border-[#aeb9c8] bg-[#f8f8f8] px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-[#164896]"
                    placeholder="Auto-generated password"
                    required
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-[#164896]"
                    aria-label={showNewUserPassword ? "Hide password" : "Show password"}
                  >
                    {showNewUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">{PASSWORD_HELPER_TEXT}</p>
                  <button
                    type="button"
                    onClick={() => setNewUser((prev) => ({ ...prev, password: generateRandomPassword() }))}
                    className="inline-flex items-center gap-2 rounded-md border border-[#cfd7e3] bg-white px-3 py-2 text-xs font-semibold text-[#164896] transition hover:bg-[#eef3fb]"
                  >
                    <RefreshCw size={14} />
                    Generate Another
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-[18px] font-bold leading-none text-[#164896]">Email</span>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-lg border border-[#aeb9c8] bg-[#f8f8f8] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#164896]"
                  placeholder="your@email.com"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[18px] font-bold leading-none text-[#164896]">Role</span>
                <select
                  value={newUser.role}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value }))}
                  className="w-full rounded-lg border border-[#aeb9c8] bg-[#f8f8f8] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#164896]"
                >
                  <option value="">Select a role</option>
                  {isSuperAdminSession ? <option value="admin">Admin</option> : null}
                  <option value="editor">Editor</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-3 rounded-lg bg-[#2f7b0b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#266608] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Plus size={20} />
                Add New User
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-[26px] border border-[#cfd7e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <div className="border-b border-[#dde5ef] bg-[#f3f5f8] px-6 py-3 text-center text-sm font-semibold text-slate-700">
            Users
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#1d4f9d] text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Username</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No users found.</td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isAdmin = user.role === "admin";
                    const canManageThisUser = !isAdmin || isSuperAdminSession;

                    return (
                      <tr key={user.id} className="border-b border-[#e5e7eb] bg-white">
                        <td className="px-4 py-3 font-medium text-slate-800">{user.name || "-"}</td>
                        <td className="px-4 py-3 text-slate-700">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleBadgeClasses(user.role)}`}>
                            {getAdminRoleBadgeLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={!canManageThisUser}
                              onClick={() => handleRemove(user.id)}
                              className={[
                                "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-white transition",
                                canManageThisUser ? "bg-[#c11212] hover:bg-[#9e0d0d]" : "cursor-not-allowed bg-[#b8b8b8]",
                              ].join(" ")}
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

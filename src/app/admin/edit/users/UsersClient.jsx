"use client";

import { Eye, EyeOff, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { validateApplicationStyleEmail } from "@/lib/email-validation";

const initialNewUser = { name: "", email: "", password: "", role: "" };
const initialEditForm = { name: "", email: "" };

function roleBadgeClasses(role) {
  return role === "admin"
    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
    : "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
}

export default function UsersClient({ initialUserName, initialRole }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [newUser, setNewUser] = useState(initialNewUser);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);
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
      if (editingUser?.id === id) {
        setEditingUser(null);
        setEditForm(initialEditForm);
      }
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

    if (!newUser.role) {
      setMessage("Select a role.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        const created = await res.json();
        setUsers((prev) => [...prev, created]);
        setNewUser(initialNewUser);
        setMessage("User created.");
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

  const startEditUser = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name || "", email: user.email });
    setMessage("");
  };

  const handleEditUser = async (event) => {
    event.preventDefault();
    if (!editingUser) return;

    setMessage("");
    const emailError = validateApplicationStyleEmail(editForm.email);
    if (emailError) {
      setMessage(emailError);
      return;
    }

    setSaving(true);
    try {
      const payload = { name: editForm.name, email: editForm.email };
      const res = await fetch(`/api/admin/users?id=${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? { ...user, ...payload } : user)));
        setEditingUser(null);
        setEditForm(initialEditForm);
        setMessage("User updated.");
      } else {
        const errorJson = await res.json().catch(() => ({}));
        if (errorJson?.error === "Email already exists") {
          setMessage("This Email is already in use.");
        } else {
          setMessage(errorJson?.error || "Error updating user.");
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
                <span className="mb-2 block text-[18px] font-bold leading-none text-[#164896]">Name</span>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-lg border border-[#aeb9c8] bg-[#f8f8f8] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#164896]"
                  placeholder="Enter name"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[18px] font-bold leading-none text-[#164896]">Password</span>
                <div className="relative">
                  <input
                    type={showNewUserPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
                    className="w-full rounded-lg border border-[#aeb9c8] bg-[#f8f8f8] px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-[#164896]"
                    placeholder="Enter new password"
                    required
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
                  <option value="admin">Admin</option>
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

          {editingUser ? (
            <form onSubmit={handleEditUser} className="border-b border-[#e2e8f0] bg-[#eef3fb] px-4 py-4">
              <div className="mb-3 text-center text-sm font-semibold text-[#164896]">Edit User</div>
              <div className="grid gap-3 lg:grid-cols-[1fr_1.7fr_auto]">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold text-slate-500">Edit name:</span>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-md border border-[#aeb9c8] bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#164896]"
                    placeholder="Edit name"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold text-slate-500">Edit email:</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-md border border-[#aeb9c8] bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#164896]"
                    placeholder="Edit email"
                    required
                  />
                </label>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#2f7b0b] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#266608] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Save size={14} />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(null);
                      setEditForm(initialEditForm);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#9ca3af] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#808892]"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : null}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#1d4f9d] text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
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
                    const isEditing = editingUser?.id === user.id;

                    return (
                      <tr key={user.id} className={isEditing ? "bg-[#eef3fb]" : "border-b border-[#e5e7eb] bg-white"}>
                        <td className="px-4 py-3 font-medium text-slate-800">{user.name || "-"}</td>
                        <td className="px-4 py-3 text-slate-700">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleBadgeClasses(user.role)}`}>
                            {user.role === "admin" ? "Admin" : "Editor"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEditUser(user)}
                              className="inline-flex items-center gap-1.5 rounded-md bg-[#1d4f9d] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#143f88]"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={isAdmin}
                              onClick={() => handleRemove(user.id)}
                              className={[
                                "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-white transition",
                                isAdmin ? "cursor-not-allowed bg-[#b8b8b8]" : "bg-[#c11212] hover:bg-[#9e0d0d]",
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
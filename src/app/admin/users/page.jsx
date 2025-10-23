"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

export default function UsersPage() {
  // Add missing currentUser and handleAddUser for demo purposes
  // Replace with your actual authentication/user context logic
  const currentUser = { id: 1, role: "admin" };
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });
  const [formError, setFormError] = useState("");
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError("");
    // Add user API call here
    // For demo, just add to users list
    if (!form.name || !form.email || !form.password) {
      setFormError("All fields are required.");
      return;
    }
    setUsers((prev) => [...prev, { ...form, id: Date.now() }]);
    setForm({ name: "", email: "", password: "", role: "editor" });
    setShowForm(false);
  };
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let didCancel = false;
    const fetchUsers = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch("/api/admin/users", { signal: controller.signal });
        clearTimeout(timeout);
        if (!didCancel && res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!didCancel) setUsers({ error: err.message || "Network error or timeout" });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    return () => { didCancel = true; };
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", role: "editor" });
  const [editError, setEditError] = useState("");
  const handleEditClick = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name || "", email: user.email, password: "", role: user.role });
    setEditError("");
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    const res = await fetch(`/api/admin/users?id=${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        email: editForm.email,
        password: editForm.password,
        role: editForm.role,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, ...editForm, password: undefined } : u));
      setEditUser(null);
    } else {
      setEditError(data.error || "Failed to update user.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">User Management</h1>
        {currentUser?.role === "admin" && (
          <div className="mb-4 flex justify-end">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? "Cancel" : "Add User"}
            </button>
          </div>
        )}
        {showForm && currentUser?.role === "admin" && (
          <form className="mb-6 p-4 border rounded bg-blue-50" onSubmit={handleAddUser}>
            <div className="mb-2">
              <label className="block font-medium mb-1">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleFormChange} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="mb-2">
              <label className="block font-medium mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleFormChange} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="mb-2">
              <label className="block font-medium mb-1">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleFormChange} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="mb-2">
              <label className="block font-medium mb-1">Role</label>
              <select name="role" value={form.role} onChange={handleFormChange} className="w-full px-3 py-2 border rounded">
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition">Create User</button>
          </form>
        )}
        {loading && (
          <div className="text-center text-gray-600">Loading users...</div>
        )}
        {!loading && Array.isArray(users) && (
          <React.Fragment>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-100 dark:bg-gray-800">
                  <th className="py-2 px-3 text-left text-blue-700 dark:text-white">Name</th>
                  <th className="py-2 px-3 text-left text-blue-700 dark:text-white">Email</th>
                  <th className="py-2 px-3 text-left text-blue-700 dark:text-white">Role</th>
                  {currentUser?.role === "admin" && <th className="py-2 px-3 text-left text-blue-700 dark:text-white">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b bg-white dark:bg-gray-900">
                    <td className="py-2 px-3 text-green-700 dark:text-green-400 font-semibold">{user.name}</td>
                    <td className="py-2 px-3 text-green-700 dark:text-green-400 font-semibold">{user.email}</td>
                    <td className="py-2 px-3 text-green-700 dark:text-green-400 font-semibold">{user.role}</td>
                    {currentUser?.role === "admin" ? (
                      <td className="py-2 px-3">
                        <button className="text-blue-600 font-bold mr-2" onClick={() => handleEditClick(user)} disabled={user.role === "admin" && user.id !== currentUser.id}>
                          Edit
                        </button>
                        {user.id !== currentUser.id && user.role !== "admin" && (
                          <button className="text-red-600 font-bold" onClick={() => handleDeleteClick(user)}>Delete</button>
                        )}
                      </td>
                    ) : currentUser?.id === user.id ? (
                      <td className="py-2 px-3">
                        <button className="text-blue-600 font-bold" onClick={() => handleEditClick(user)} disabled={user.role === "admin" && user.id !== currentUser.id}>
                          Edit
                        </button>
                      </td>
                    ) : (
                      <td className="py-2 px-3 text-gray-400">-</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {editUser && (
              <form className="mb-6 mt-6 p-4 border rounded bg-blue-50" onSubmit={handleEditSubmit}>
                <h2 className="font-bold mb-2">Edit User</h2>
                <div className="mb-2">
                  <label className="block font-medium mb-1">Name</label>
                  <input type="text" name="name" value={editForm.name} onChange={handleEditFormChange} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-2">
                  <label className="block font-medium mb-1">Email</label>
                  <input type="email" name="email" value={editForm.email} onChange={handleEditFormChange} className="w-full px-3 py-2 border rounded" required />
                </div>
                <div className="mb-2">
                  <label className="block font-medium mb-1">Password (leave blank to keep unchanged)</label>
                  <input type="password" name="password" value={editForm.password} onChange={handleEditFormChange} className="w-full px-3 py-2 border rounded" />
                </div>
                {currentUser?.role === "admin" && (
                  <div className="mb-2">
                    <label className="block font-medium mb-1">Role</label>
                    <select name="role" value={editForm.role} onChange={handleEditFormChange} className="w-full px-3 py-2 border rounded">
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}
                {editError && <div className="text-red-600 mb-2">{editError}</div>}
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition">Save Changes</button>
                <button type="button" className="ml-2 px-4 py-2 rounded border font-bold" onClick={() => setEditUser(null)}>Cancel</button>
              </form>
            )}
          </React.Fragment>
        )}
        {!loading && !Array.isArray(users) && (
          <div className="text-center text-red-600">{users.error || "Failed to load users."}</div>
        )}
      </div>
    </main>
  );
}

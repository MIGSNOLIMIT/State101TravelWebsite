"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const json = await res.json();
        setUsers(json);
      } else {
        setMessage("Error loading users.");
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this user?")) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== id));
      setMessage("User removed.");
    } else {
      setMessage("Error removing user.");
    }
  };

  const handleNewUserChange = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      const created = await res.json();
      setUsers([...users, created]);
      setNewUser({ name: "", email: "", password: "" });
      setMessage("User created.");
    } else {
      setMessage("Error creating user.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">User Management</h1>
        {message && <div className="mb-4 text-center text-blue-600">{message}</div>}
        <form onSubmit={handleCreateUser} className="mb-8 space-y-4">
          <h2 className="text-lg font-bold text-blue-700 mb-2">Add New User</h2>
          <input
            type="text"
            value={newUser.name}
            onChange={e => handleNewUserChange("name", e.target.value)}
            className="w-full px-4 py-2 border rounded bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
            placeholder="Name (optional)"
          />
          <input
            type="email"
            value={newUser.email}
            onChange={e => handleNewUserChange("email", e.target.value)}
            className="w-full px-4 py-2 border rounded bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={newUser.password}
            onChange={e => handleNewUserChange("password", e.target.value)}
            className="w-full px-4 py-2 border rounded bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
            placeholder="Password"
            required
          />
          <button type="submit" className="w-full py-3 rounded bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold hover:from-blue-700 hover:to-red-700 transition">
            Add User
          </button>
        </form>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-blue-100 dark:bg-gray-800">
              <th className="py-2 px-4 border-b text-blue-700 dark:text-white">Name</th>
              <th className="py-2 px-4 border-b text-blue-700 dark:text-white">Email</th>
              <th className="py-2 px-4 border-b text-blue-700 dark:text-white">Role</th>
              <th className="py-2 px-4 border-b text-blue-700 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="bg-white dark:bg-gray-900">
                <td className="py-2 px-4 border-b text-green-700 dark:text-green-400 font-semibold">{user.name || "-"}</td>
                <td className="py-2 px-4 border-b text-green-700 dark:text-green-400 font-semibold">{user.email}</td>
                <td className="py-2 px-4 border-b text-green-700 dark:text-green-400 font-semibold">{user.role}</td>
                <td className="py-2 px-4 border-b">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleRemove(user.id)}
                      className="px-3 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
// ---
// COMMENT: This file is the correct and only user management page you need. You can safely delete src/app/admin/users/page.jsx as it is a duplicate and contains demo logic that will break your real backend integration.

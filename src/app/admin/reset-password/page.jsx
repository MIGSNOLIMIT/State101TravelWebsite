"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!token) {
      setMessage("Invalid or missing token.");
      return;
    }
    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successful. You may now log in.");
        setTimeout(() => router.push("/admin/login"), 2000);
      } else {
        setMessage(data.error || "Error resetting password.");
      }
    } catch {
      setMessage("Network error or timeout.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-red-600 to-blue-900">
      <div className="absolute top-40 left-6 z-10">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition"
        >
          ← Back
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Reset Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold hover:from-blue-700 hover:to-red-700 transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-blue-600">{message}</div>
        )}
      </div>
    </main>
  );
}

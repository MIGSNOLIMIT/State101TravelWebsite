"use client";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (res.ok) {
        setMessage("If your email is registered, a reset link has been sent.");
      } else {
        setMessage(data.error || "Error sending reset link.");
      }
    } catch {
      setMessage("Network error or timeout.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-red-600 to-blue-900">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Forgot Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Gmail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="your.email@gmail.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold hover:from-blue-700 hover:to-red-700 transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-blue-600">{message}</div>
        )}
      </div>
    </main>
  );
}

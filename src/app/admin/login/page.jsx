"use client";
import { useState } from "react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (res.ok) {
        window.location.href = "/admin/dashboard";
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error or timeout");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-red-600 to-blue-900">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/images/state101-logo.png"
            alt="State101 Logo"
            width={120}
            height={120}
            className="mb-2 rounded-full border-4 border-blue-600 bg-white"
          />
          <h1 className="text-2xl font-bold text-blue-700 mb-1">
            Admin Login
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to manage website content
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold hover:from-blue-700 hover:to-red-700 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <a
            href="/admin/forgot-password"
            className="text-blue-600 hover:underline text-sm"
          >
            Forgot password?
          </a>
        </div>
      </div>
    </main>
  );
}

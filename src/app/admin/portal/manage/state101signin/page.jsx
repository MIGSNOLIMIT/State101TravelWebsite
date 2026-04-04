"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#123f87] px-5 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,33,74,0.18)_0%,rgba(10,33,74,0.28)_100%)]" />
      <div className="relative z-10 w-full max-w-[340px] text-white">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-white p-3 shadow-[0_20px_40px_rgba(8,20,48,0.28)]">
          <Image
            src="/images/logo.png"
            alt="State101 Logo"
            width={160}
            height={160}
            className="rounded-full bg-white object-contain"
          />
          </div>
          <h1 className="mt-8 text-center text-[38px] font-semibold tracking-[-0.02em] text-white md:text-[42px]">
            Admin Login
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-9 space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-white/80 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-white focus:ring-2 focus:ring-white/60"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-password-input w-full rounded-md border border-white/80 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-white focus:ring-2 focus:ring-white/60"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#123f87] focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88a3 3 0 104.24 4.24" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.22 4.22l15.56 15.56" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-center text-sm text-[#ffd3d3]">{error}</div>
          )}
          <div className="flex justify-end">
            <Link
              href="/admin/forgot-password"
              className="text-sm font-semibold text-white transition hover:text-white/80"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md border-2 border-white bg-[#0c214d] py-3 text-base font-semibold text-white transition hover:bg-[#081735] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
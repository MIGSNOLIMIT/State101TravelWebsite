"use client";
import { useState } from "react";
import Image from "next/image";
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
        setTimeout(() => router.push("/admin/portal/manage/state101signin"), 2000);
      } else {
        setMessage(data.error || "Error resetting password.");
      }
    } catch {
      setMessage("Network error or timeout.");
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
            Reset Password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-9 space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/80 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-white focus:ring-2 focus:ring-white/60"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-white/80 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-white focus:ring-2 focus:ring-white/60"
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md border-2 border-white bg-[#0c214d] py-3 text-base font-semibold text-white transition hover:bg-[#081735] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm text-white/90">{message}</div>
        )}
      </div>
    </main>
  );
}

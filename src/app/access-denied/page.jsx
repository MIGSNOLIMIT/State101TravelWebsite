export const dynamic = "force-dynamic";

import Link from "next/link";

export default function AccessDeniedPage({ searchParams }) {
  const requestedPath = typeof searchParams?.from === "string" ? searchParams.from : "";
  const returnHref = requestedPath.startsWith("/admin") ? "/admin/portal/manage/state101signin" : "/";
  const returnLabel = requestedPath.startsWith("/admin") ? "Go to Admin Sign In" : "Return Home";

  return (
    <section className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(29,79,157,0.22),_transparent_46%),linear-gradient(180deg,_#eef4ff_0%,_#dbe7f7_100%)] px-6 py-16">
      <div className="w-full max-w-2xl rounded-[32px] border border-[#c8d6ea] bg-white px-8 py-12 text-center shadow-[0_30px_80px_rgba(15,23,42,0.18)] md:px-12">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#1d4f9d]">Access Denied</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">You do not have permission to open this page.</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          This request was blocked because your account is not allowed to view the requested area.
          {requestedPath ? ` Requested page: ${requestedPath}` : ""}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={returnHref} className="inline-flex items-center justify-center rounded-xl bg-[#164896] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#103773]">
            {returnLabel}
          </Link>
          <Link href="/" className="inline-flex items-center justify-center rounded-xl border border-[#c8d6ea] px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Open Public Site
          </Link>
        </div>
      </div>
    </section>
  );
}
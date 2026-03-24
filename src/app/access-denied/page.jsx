export const dynamic = "force-dynamic";

export default function AccessDeniedPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(29,79,157,0.16),_transparent_48%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-6 py-16">
      <div className="w-full max-w-xl rounded-[28px] border border-[#d6deea] bg-white px-8 py-12 text-center shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.28em] text-[#1d4f9d]">Access Denied</h1>
      </div>
    </section>
  );
}
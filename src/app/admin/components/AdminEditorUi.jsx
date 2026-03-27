export function AdminEditorCard({ title, children, contentClassName = "" }) {
  return (
    <section className="overflow-hidden rounded-[24px] border-2 border-[#9eb8e3] bg-white shadow-[0_16px_34px_rgba(15,23,42,0.14)] dark:border-[#5d7fb3] dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-[#efefef] px-5 py-2 text-center text-xs font-semibold text-slate-700 md:px-6 dark:border-[#4d6f9f] dark:bg-slate-950 dark:text-slate-200">
        {title}
      </div>
      <div className={["px-5 py-6 md:px-6", contentClassName].join(" ").trim()}>{children}</div>
    </section>
  );
}

export function AdminEditorStrip({ title, className = "" }) {
  return (
    <div className={[
      "border-y border-slate-200 bg-[#efefef] px-5 py-2 text-center text-xs font-semibold text-slate-700 dark:border-[#4d6f9f] dark:bg-slate-950 dark:text-slate-200",
      className,
    ].join(" ")}>
      {title}
    </div>
  );
}

export function AdminEditorLabel({ children, className = "" }) {
  return <label className={["block text-[18px] font-bold leading-none text-[#1f57a4]", className].join(" ")}>{children}</label>;
}

export function AdminEditorNote({ children, className = "" }) {
  return <p className={["text-sm text-slate-500", className].join(" ")}>{children}</p>;
}

export const adminEditorInputClass = "mt-2 w-full rounded-lg border-2 border-[#adc3ea] bg-white px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.05)] outline-none transition placeholder:text-slate-400 hover:border-[#8eaddd] focus:border-[#1f57a4] focus:ring-4 focus:ring-[#d8e5fb] dark:border-[#4d6f9f] dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-[#7398d2] dark:focus:ring-[#16325c]";

export const adminEditorTextareaClass = "mt-2 w-full rounded-lg border-2 border-[#adc3ea] bg-white px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.05)] outline-none transition placeholder:text-slate-400 hover:border-[#8eaddd] focus:border-[#1f57a4] focus:ring-4 focus:ring-[#d8e5fb] dark:border-[#4d6f9f] dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-[#7398d2] dark:focus:ring-[#16325c]";

export const adminEditorReadonlyClass = "mt-2 rounded-lg border-2 border-[#adc3ea] bg-[#f8fbff] px-4 py-3 text-lg font-semibold text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.05)] dark:border-[#4d6f9f] dark:bg-slate-950 dark:text-slate-100";
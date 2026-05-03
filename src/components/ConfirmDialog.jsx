"use client";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Save anyway",
  cancelText = "Cancel",
  confirmTone = "primary",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmButtonClassName =
    confirmTone === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600"
      : "bg-[#164896] text-white hover:bg-[#103773] focus-visible:outline-[#164896]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-950/60"
        aria-hidden="true"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-lg rounded-[28px] border border-[#d9e3f1] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#164896]">Confirmation</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#cbd5e1] px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              confirmButtonClassName,
            ].join(" ")}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

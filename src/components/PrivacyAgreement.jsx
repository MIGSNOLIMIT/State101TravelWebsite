"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  PRIVACY_AGREEMENT_CHECKBOX_LABEL,
  PRIVACY_AGREEMENT_READY_MESSAGE,
  PRIVACY_AGREEMENT_TEXT,
  PRIVACY_AGREEMENT_UNLOCK_MESSAGE,
} from "@/lib/privacy-agreement";

export default function PrivacyAgreement({ checked, onCheckedChange, resetKey = 0 }) {
  const agreementRef = useRef(null);
  const checkboxId = useId();
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
    const element = agreementRef.current;
    if (!element) return;

    element.scrollTop = 0;
    setHasReachedEnd(element.scrollHeight <= element.clientHeight + 8);
  }, [resetKey]);

  function handleScroll() {
    const element = agreementRef.current;
    if (!element) return;

    const remainingScroll = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (remainingScroll <= 8) {
      setHasReachedEnd(true);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Privacy Agreement</h3>
        <p className="mt-1 text-xs text-slate-600">
          Read the full agreement below. The I Agree checkbox will unlock after you scroll to the end.
        </p>
      </div>

      <div
        ref={agreementRef}
        onScroll={handleScroll}
        className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4"
      >
        <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">
          {PRIVACY_AGREEMENT_TEXT}
        </pre>
      </div>

      <p className={`text-xs ${hasReachedEnd ? "text-green-700" : "text-slate-600"}`}>
        {hasReachedEnd ? PRIVACY_AGREEMENT_READY_MESSAGE : PRIVACY_AGREEMENT_UNLOCK_MESSAGE}
      </p>

      <label
        htmlFor={checkboxId}
        className={`flex items-start gap-3 rounded-lg border px-3 py-3 text-sm ${
          hasReachedEnd
            ? "border-slate-200 bg-white text-slate-700"
            : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
        }`}
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          disabled={!hasReachedEnd}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
        />
        <span>{PRIVACY_AGREEMENT_CHECKBOX_LABEL}</span>
      </label>
    </div>
  );
}

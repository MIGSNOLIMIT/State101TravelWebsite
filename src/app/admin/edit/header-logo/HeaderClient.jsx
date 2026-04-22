"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import AdminShell from "@/app/admin/components/AdminShell";
import { AdminEditorCard, AdminEditorLabel, adminEditorInputClass } from "@/app/admin/components/AdminEditorUi";
import ConfirmDialog from "@/components/ConfirmDialog";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";

const PLACEHOLDER = "/images/placeholder_logo.png";

export default function HeaderClient({ initialUserName, initialRole }) {
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [mediaWarning, setMediaWarning] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/header");
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (ignore) return;
        setLogoUrl(json.logoUrl || "");
        setWebsiteName(json.websiteName || "");
        setMessage("");
      } catch {
        if (!ignore) setMessage("Error loading header data.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  const doSave = async () => {
    setPendingSave(true);
    try {
      const res = await fetch("/api/admin/header", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl, websiteName }),
      });
      if (res.ok) {
        setMessage("Header updated!");
      } else {
        const error = await res.json().catch(() => ({}));
        setMessage(error?.error || "Error saving changes.");
      }
    } finally {
      setPendingSave(false);
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    if (mediaWarning) {
      setMessage(mediaWarning);
      setSaving(false);
      return;
    }

    const anyEmpty = !logoUrl.trim() || !websiteName.trim();
    if (anyEmpty) {
      setConfirmOpen(true);
      return;
    }

    await doSave();
  };

  return (
    <AdminShell title="Header" userName={initialUserName} role={initialRole}>
      <AdminEditorCard title="Header Settings">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500">Loading header data...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <AdminEditorLabel>Select Header Logo</AdminEditorLabel>
              <div className="mt-3 rounded-[18px] border-2 border-[#9eb8e3] p-3 dark:border-[#5d7fb3]">
                <MediaLibraryPicker
                  multiple={false}
                  value={logoUrl || ""}
                  onChange={(value) => setLogoUrl(value)}
                  onValidationStateChange={(warning) => setMediaWarning(warning ? 'There is an invalid media file in the "Header Logo" section. Changes will not be saved.' : "")}
                  accept="image/*"
                  folder="header"
                />
              </div>
            </div>

            <div>
              <AdminEditorLabel>Selected Header Logo</AdminEditorLabel>
              <div className="mt-3 rounded-md border border-[#c7d5eb] bg-white px-4 py-3 dark:border-[#4d6f9f] dark:bg-slate-900">
                <Image src={logoUrl || PLACEHOLDER} alt="Header logo preview" width={120} height={90} className="object-contain" />
              </div>
            </div>

            <div>
              <AdminEditorLabel>Website Name</AdminEditorLabel>
              <input
                type="text"
                value={websiteName}
                onChange={(event) => setWebsiteName(event.target.value)}
                className={adminEditorInputClass}
                placeholder="Enter website name"
                maxLength={80}
              />
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-h-6 text-sm font-medium text-[#1f57a4]">{message}</div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-3 rounded-md bg-[#2c7a10] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24640d] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save All Changes"}
              </button>
            </div>
          </form>
        )}

        <ConfirmDialog
          open={confirmOpen}
          title="Save header with empty fields?"
          message="The header logo or website name is empty. Are you sure you want to save with empty values?"
          confirmText={pendingSave ? "Saving..." : "Save anyway"}
          cancelText="Cancel"
          onCancel={() => {
            setConfirmOpen(false);
            setSaving(false);
          }}
          onConfirm={doSave}
        />
      </AdminEditorCard>
    </AdminShell>
  );
}
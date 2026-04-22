"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { AdminEditorCard, AdminEditorLabel, AdminEditorNote, AdminEditorStrip, adminEditorInputClass, adminEditorReadonlyClass } from "@/app/admin/components/AdminEditorUi";
import ConfirmDialog from "@/components/ConfirmDialog";
import RichTextEditor from "@/components/RichTextEditor";
import Image from "next/image";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";

const PLACEHOLDER = "/images/placeholder_logo.png";

export default function TermsOfServiceClient({ initialUserName, initialRole }) {
  const [terms, setTerms] = useState({ heading: "", editorContent: "" });
  const [logos, setLogos] = useState(["", "", ""]);
  const [names, setNames] = useState(["", "", ""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaWarnings, setMediaWarnings] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const base = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
        const termsRes = await fetch(`${base}/api/admin/terms-of-service`, { signal: controller.signal });
        clearTimeout(timeout);
        if (!didCancel && termsRes.ok) {
          const termsJson = await termsRes.json();
          setTerms({ heading: termsJson.heading || "", editorContent: termsJson.editorContent || "" });
        }

        const logosRes = await fetch("/api/admin/accreditations", { signal: controller.signal });
        if (!didCancel && logosRes.ok) {
          const logosJson = await logosRes.json();
          const logoArr = ["", "", ""];
          const nameArr = ["", "", ""];
          logosJson.forEach((item, index) => {
            logoArr[index] = item.logoUrl || "";
            nameArr[index] = item.name || "";
          });
          setLogos(logoArr);
          setNames(nameArr);
        }
      } catch {
        if (!didCancel) setMessage("Error loading data");
      } finally {
        if (!didCancel) setLoading(false);
      }
    }

    fetchData();
    return () => {
      didCancel = true;
    };
  }, []);

  const handleLogoChange = (index, field, value) => {
    if (field === "logo") {
      setLogos((prev) => prev.map((logo, logoIndex) => (logoIndex === index ? value : logo)));
      return;
    }
    setNames((prev) => prev.map((name, nameIndex) => (nameIndex === index ? value : name)));
  };

  const setMediaWarning = (index, warning) => {
    setMediaWarnings((prev) => ({
      ...prev,
      [index]: warning ? `There is an invalid media file in the \"TOS Page Logo ${index + 1}\" section. Changes will not be saved.` : "",
    }));
  };

  const doSave = async () => {
    setPendingSave(true);
    try {
      const htmlTerms = {
        heading: terms.heading,
        editorContent: terms.editorContent || "",
        content: terms.editorContent || "",
      };
      const base = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

      await fetch(`${base}/api/admin/terms-of-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(htmlTerms),
      });

      const accreditationData = logos.map((logoUrl, index) => ({ logoUrl, name: names[index] }));
      await fetch("/api/admin/accreditations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accreditationData),
      });

      setMessage("Terms of Service and Accreditations updated!");
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
    const blockingWarnings = Object.values(mediaWarnings).filter(Boolean);
    if (blockingWarnings.length) {
      setMessage(blockingWarnings[0]);
      setSaving(false);
      return;
    }
    const anyEmpty = !(terms.editorContent && terms.editorContent.trim()) || logos.some((logo) => !logo);
    if (anyEmpty) {
      setConfirmOpen(true);
      return;
    }
    await doSave();
  };

  return (
    <AdminShell title="TOS Page" userName={initialUserName} role={initialRole}>
      <form onSubmit={handleSave} className="space-y-6">
        <AdminEditorCard title="Terms of Service">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-500">Loading terms data...</div>
          ) : (
            <div className="space-y-5">
              <div>
                <AdminEditorLabel>Heading</AdminEditorLabel>
                <div className={adminEditorReadonlyClass}>
                  Terms of Service
                </div>
              </div>
              <div>
                <AdminEditorLabel>Content</AdminEditorLabel>
                <AdminEditorNote className="mt-2 leading-6">
                  Use the buttons above the editor to apply bold, italic, and underline formatting.
                </AdminEditorNote>
                <RichTextEditor
                  value={terms.editorContent || ""}
                  onChange={(value) => setTerms((prev) => ({ ...prev, editorContent: value }))}
                  placeholder="Enter Terms of Service content here"
                />
              </div>
            </div>
          )}
        </AdminEditorCard>

        <AdminEditorCard title="Accreditation Logos" contentClassName="px-0 py-0">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <AdminEditorStrip title={`TOS Page Logo ${index + 1}`} className={index === 0 ? "border-t-0" : ""} />
              <div className="space-y-5 px-5 py-6 md:px-6">
                <div>
                  <AdminEditorLabel className="pt-2">Select a Logo</AdminEditorLabel>
                  <div className="mt-3 rounded-[18px] border-2 border-[#9eb8e3] p-3 dark:border-[#5d7fb3]">
                    <MediaLibraryPicker
                      multiple={false}
                      value={logos[index] || ""}
                      onValidationStateChange={(warning) => setMediaWarning(index, warning)}
                      onChange={(value) => handleLogoChange(index, "logo", value)}
                      accept="image/*"
                      folder="tos"
                    />
                  </div>
                </div>
                <div>
                  <AdminEditorLabel className="pt-2">Selected Logo</AdminEditorLabel>
                  <div className="mt-3 rounded-md border border-[#c7d5eb] bg-white px-4 py-3 dark:border-[#4d6f9f] dark:bg-slate-900">
                    <Image src={logos[index] || PLACEHOLDER} alt={names[index] || `Logo ${index + 1}`} width={120} height={90} className="object-contain" />
                  </div>
                </div>
                <div>
                  <AdminEditorLabel className="pt-2">Logo Name</AdminEditorLabel>
                  <input type="text" value={names[index] || ""} onChange={(event) => handleLogoChange(index, "name", event.target.value)} className={adminEditorInputClass} placeholder="Logo name (optional)" />
                </div>
              </div>
            </div>
          ))}
        </AdminEditorCard>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-h-6 text-sm font-medium text-[#1f57a4]">{message}</div>
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-3 rounded-md bg-[#2c7a10] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24640d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title="Save terms with empty fields?"
          message="Some Terms content or accreditation logos are empty. Are you sure you want to save with empty values?"
          confirmText={pendingSave ? "Saving..." : "Save anyway"}
          cancelText="Cancel"
          onCancel={() => {
            setConfirmOpen(false);
            setSaving(false);
          }}
          onConfirm={doSave}
        />
      </form>
    </AdminShell>
  );
}
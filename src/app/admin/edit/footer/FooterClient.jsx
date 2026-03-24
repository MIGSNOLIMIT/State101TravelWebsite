"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { AdminEditorCard, AdminEditorLabel, AdminEditorStrip, adminEditorInputClass } from "@/app/admin/components/AdminEditorUi";
import ConfirmDialog from "@/components/ConfirmDialog";

const SOCIAL_PLATFORMS = ["Facebook", "Instagram", "TikTok"];

export default function FooterClient({ initialUserName, initialRole }) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [socialLinks, setSocialLinks] = useState([
    { platform: "Facebook", url: "" },
    { platform: "Instagram", url: "" },
    { platform: "TikTok", url: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/footer");
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (ignore) return;

        setPhone(json.phone || "");
        setEmail(json.email || "");
        setAddress(json.address || "");

        let links = [];
        try {
          links = JSON.parse(json.socialLinks || "[]");
        } catch {
          links = [];
        }

        setSocialLinks(
          SOCIAL_PLATFORMS.map((platform, index) =>
            links[index] && links[index].platform === platform ? links[index] : { platform, url: "" }
          )
        );
        setMessage("");
      } catch {
        if (!ignore) setMessage("Error loading footer data.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSocialChange = (index, value) => {
    setSocialLinks((prev) => prev.map((item, currentIndex) => (currentIndex === index ? { ...item, url: value } : item)));
  };

  const doSave = async () => {
    setPendingSave(true);
    try {
      const res = await fetch("/api/admin/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email, address, socialLinks }),
      });
      setMessage(res.ok ? "Footer updated!" : "Error saving changes.");
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

    const anyEmpty = !phone.trim() || !email.trim() || !address.trim() || socialLinks.some((link) => !link.url.trim());
    if (anyEmpty) {
      setConfirmOpen(true);
      return;
    }

    await doSave();
  };

  return (
    <AdminShell title="Footer" userName={initialUserName} role={initialRole}>
      <AdminEditorCard title="Footer Settings" contentClassName="px-0 py-0">
        {loading ? (
          <div className="flex h-40 items-center justify-center px-5 py-6 text-sm text-slate-500 md:px-6">Loading footer data...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-0">
            <AdminEditorStrip title="Contact Us" />
            <div className="px-5 py-6 md:px-6">
              <div className="space-y-6">
                <div>
                  <AdminEditorLabel>Edit Address</AdminEditorLabel>
                  <input type="text" value={address} onChange={(event) => setAddress(event.target.value)} className={adminEditorInputClass} placeholder="Enter address" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <AdminEditorLabel>Edit Phone Number</AdminEditorLabel>
                    <input type="text" value={phone} onChange={(event) => setPhone(event.target.value)} className={adminEditorInputClass} placeholder="Enter phone number" />
                  </div>
                  <div>
                    <AdminEditorLabel>Edit Email</AdminEditorLabel>
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={adminEditorInputClass} placeholder="Enter email address" />
                  </div>
                </div>
              </div>
            </div>

            <AdminEditorStrip title="Social Links" />
            <div className="px-5 py-6 md:px-6">
              <div className="space-y-5">
                {socialLinks.map((item, index) => (
                  <div key={item.platform}>
                    <AdminEditorLabel>{item.platform} URL</AdminEditorLabel>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(event) => handleSocialChange(index, event.target.value)}
                      className={adminEditorInputClass}
                      placeholder={`Paste ${item.platform} URL here`}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
            </div>
          </form>
        )}

        <ConfirmDialog
          open={confirmOpen}
          title="Save footer with empty fields?"
          message="Some footer fields are empty. Are you sure you want to save with empty values?"
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
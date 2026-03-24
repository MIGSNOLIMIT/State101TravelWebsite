"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { AdminEditorCard, AdminEditorLabel, adminEditorInputClass } from "@/app/admin/components/AdminEditorUi";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function TopBarClient({ initialUserName, initialRole }) {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch("/api/topbar", { signal: controller.signal });
        clearTimeout(timeout);

        if (!didCancel && res.ok) {
          const json = await res.json();
          setAddress(json.address || "");
          setPhone(json.phone || "");
          setEmail(json.email || "");
          setMessage("");
        } else if (!didCancel) {
          setMessage("Error loading top bar data.");
        }
      } catch {
        if (!didCancel) setMessage("Error loading top bar data.");
      } finally {
        if (!didCancel) setLoading(false);
      }
    }

    fetchData();
    return () => {
      didCancel = true;
    };
  }, []);

  const doSave = async () => {
    setPendingSave(true);
    try {
      const res = await fetch("/api/topbar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, phone, email }),
      });

      if (res.ok) {
        setMessage("Top bar updated!");
      } else {
        setMessage("Error saving changes.");
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

    const anyEmpty = !address.trim() || !phone.trim() || !email.trim();
    if (anyEmpty) {
      setConfirmOpen(true);
      return;
    }

    await doSave();
  };

  return (
    <AdminShell title="Top Bar" userName={initialUserName} role={initialRole}>
      <AdminEditorCard title="Contact Us">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-500">Loading top bar data...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <AdminEditorLabel>Edit Address</AdminEditorLabel>
                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className={adminEditorInputClass}
                  placeholder="Enter address"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <AdminEditorLabel>Edit Phone Number</AdminEditorLabel>
                  <input
                    type="text"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className={adminEditorInputClass}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <AdminEditorLabel>Edit Email</AdminEditorLabel>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={adminEditorInputClass}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-h-6 text-sm font-medium text-[#1f57a4]">{message}</div>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-3 rounded-md bg-[#2c7a10] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24640d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        
        <ConfirmDialog
          open={confirmOpen}
          title="Save top bar with empty fields?"
          message="Some top bar fields are empty. Are you sure you want to save with empty values?"
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
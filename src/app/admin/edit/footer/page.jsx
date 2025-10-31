"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SOCIAL_PLATFORMS = ["Facebook", "Instagram", "TikTok"];

export default function EditFooter() {
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
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch("/api/admin/footer");
      if (res.ok) {
        const json = await res.json();
        setPhone(json.phone || "");
        setEmail(json.email || "");
        setAddress(json.address || "");
        let links = [];
        try {
          links = JSON.parse(json.socialLinks || "[]");
        } catch {
          links = [
            { platform: "Facebook", url: "" },
            { platform: "Instagram", url: "" },
            { platform: "TikTok", url: "" },
          ];
        }
        setSocialLinks(
          SOCIAL_PLATFORMS.map((platform, i) =>
            links[i] && links[i].platform === platform
              ? links[i]
              : { platform, url: "" }
          )
        );
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSocialChange = (idx, value) => {
    setSocialLinks((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, url: value } : item))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    // Validation: all fields required
    if (!phone.trim() || !email.trim() || !address.trim() || socialLinks.some(link => !link.url.trim())) {
      setMessage("All fields are required. Please fill in phone, email, address, and all social links.");
      setSaving(false);
      return;
    }
    const res = await fetch("/api/admin/footer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, email, address, socialLinks }),
    });
    if (res.ok) setMessage("Footer updated!");
    else setMessage("Error saving changes.");
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Edit Footer
        </h1>
        <form onSubmit={handleSave} className="space-y-8">
          <section>
            <label className="block mb-1 font-medium text-blue-700">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-3 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
              placeholder="Enter phone number"
            />
          </section>
          <section>
            <label className="block mb-1 font-medium text-blue-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-3 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
              placeholder="Enter email address"
            />
          </section>
          <section>
            <label className="block mb-1 font-medium text-blue-700">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-3 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
              placeholder="Enter address"
            />
          </section>
          <section>
            <label className="block mb-1 font-medium text-blue-700">Social Links</label>
            {socialLinks.map((item, idx) => (
              <div key={item.platform} className="mb-3">
                <label className="block text-sm font-semibold mb-1 text-blue-700">
                  {item.platform} URL
                </label>
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => handleSocialChange(idx, e.target.value)}
                  className="w-full px-4 py-2 border rounded bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
                  placeholder={`Paste ${item.platform} URL here`}
                />
              </div>
            ))}
          </section>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold hover:from-blue-700 hover:to-red-700 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && (
            <div className="mt-4 text-center text-green-600 font-semibold">
              {message}
            </div>
          )}
        </form>
      </div>
      <div className="absolute top-40 left-6 z-10">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition"
        >
          ← Back
        </button>
      </div>
    </main>
  );
}

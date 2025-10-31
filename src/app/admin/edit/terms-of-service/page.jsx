"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import dynamic from "next/dynamic";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { ssr: false });

const PLACEHOLDER = "/images/placeholder_logo.png";

export default function EditTermsOfService() {
  const router = useRouter();
  const [terms, setTerms] = useState({ heading: "", content: "" });
  const [logos, setLogos] = useState(["", "", ""]);
  const [names, setNames] = useState(["", "", ""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let didCancel = false;
    async function fetchData() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
          const base =
            process.env.NEXT_PUBLIC_SITE_URL ||
            (typeof window !== "undefined"
              ? window.location.origin
              : process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : "http://localhost:3000");
          const termsRes = await fetch(`${base}/api/admin/terms-of-service`, { signal: controller.signal });
        clearTimeout(timeout);
        if (!didCancel && termsRes.ok) {
          const termsJson = await termsRes.json();
          setTerms({ heading: termsJson.heading || "", content: termsJson.content || "" });
        }
        const logosRes = await fetch("/api/admin/accreditations", { signal: controller.signal });
        if (!didCancel && logosRes.ok) {
          const logosJson = await logosRes.json();
          const logoArr = ["", "", ""];
          const nameArr = ["", "", ""];
          logosJson.forEach((item, i) => {
            logoArr[i] = item.logoUrl || "";
            nameArr[i] = item.name || "";
          });
          setLogos(logoArr);
          setNames(nameArr);
        }
      } catch (err) {
        if (!didCancel) setMessage("Error loading data");
      }
      setLoading(false);
    }
    fetchData();
    return () => { didCancel = true; };
  }, []);

  const handleTermsChange = (field, value) => {
    setTerms((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (idx, field, value) => {
    if (field === "logo") {
      setLogos((prev) => prev.map((v, i) => (i === idx ? value : v)));
    } else {
      setNames((prev) => prev.map((v, i) => (i === idx ? value : v)));
    }
  };

  // Converts plain text ToS to HTML
  function tosTextToHtml(text) {
    // Section headers: lines starting with number-dot
    text = text.replace(/^(\d+\. .+)/gm, '<h2>$1</h2>');
    // Bullets: lines starting with bullet or dash
    text = text.replace(/^•\s*(.+)$/gm, '<ul><li>$1</li></ul>');
    text = text.replace(/^\-\s*(.+)$/gm, '<ul><li>$1</li></ul>');
    // Paragraphs: lines not headers or bullets
    text = text.replace(/([^>])\n(?=[^<])/g, '$1<br>');
    // Merge consecutive <ul> tags
    text = text.replace(/(<\/ul>)(\s*)<ul>/g, '');
    return text;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    // Convert content to HTML before saving
    const htmlTerms = {
      ...terms,
      content: tosTextToHtml(terms.content || ""),
    };
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    await fetch(`${base}/api/admin/terms-of-service`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(htmlTerms),
    });
    // Save accreditations
    const data = logos.map((logoUrl, i) => ({ logoUrl, name: names[i] }));
    await fetch("/api/admin/accreditations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setMessage("Terms of Service and Accreditations updated!");
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-12">
      <div className="absolute top-40 left-6 z-10">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition"
        >
          ← Back
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Edit Terms of Service & Accreditations</h1>
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded">
          <strong>Formatting Guide:</strong>
          <ul className="list-disc ml-6 mt-2">
            <li>Lines starting with <code>1. </code>, <code>2. </code>, etc. become section headers.</li>
            <li>Lines starting with <code>•</code> or <code>-</code> become bullet points.</li>
            <li>Other lines are converted to paragraphs with line breaks.</li>
            <li>Your text will be automatically converted to HTML for display.</li>
          </ul>
        </div>
        <form onSubmit={handleSave} className="space-y-8">
          <section>
            <label className="block mb-1 font-medium text-blue-700 dark:text-blue-400">Heading</label>
            <div className="font-bold text-xl mb-4">Terms of Service</div>
            <label className="block mb-1 font-medium text-blue-700 dark:text-blue-400">Content</label>
            <textarea
              value={terms.content || ""}
              onChange={e => handleTermsChange("content", e.target.value)}
              className="w-full px-4 py-2 border rounded min-h-[180px] bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
              placeholder="Enter Terms of Service content here"
            />
          </section>
          <section>
            <h2 className="text-xl font-bold mb-4 text-blue-600">Accreditations</h2>
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="mb-6">
                <label className="block mb-1 font-medium text-blue-700 dark:text-blue-400">Logo {idx + 1} URL</label>
                <MediaLibraryPicker
                  multiple={false}
                  value={logos[idx] || ""}
                  onChange={url => handleLogoChange(idx, "logo", url)}
                  accept="image/*"
                />
                <label className="block mb-1 font-medium text-blue-700 dark:text-blue-400">Logo {idx + 1} Name (optional)</label>
                <input
                  type="text"
                  value={names[idx] || ""}
                  onChange={e => handleLogoChange(idx, "name", e.target.value)}
                  className="w-full px-4 py-2 border rounded mb-3"
                  placeholder="Logo name (optional)"
                />
                <div className="mt-2 flex justify-center">
                  <Image
                    src={logos[idx] || PLACEHOLDER}
                    alt={names[idx] || `Logo ${idx + 1}`}
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </section>
          <button type="submit" disabled={saving} className="w-full py-3 rounded bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold hover:from-blue-700 hover:to-red-700 transition">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && <div className="mt-4 text-center text-blue-600">{message}</div>}
        </form>
      </div>
    </main>
  );
}

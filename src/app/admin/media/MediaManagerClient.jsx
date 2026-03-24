"use client";

import { useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";

export default function MediaManagerClient({ initialUserName, initialRole }) {
  const [selectedMedia, setSelectedMedia] = useState([]);

  return (
    <AdminShell title="Media Library" userName={initialUserName} role={initialRole}>
      <div className="space-y-6">
        <section className="rounded-[24px] border-2 border-[#9eb8e3] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.12)] dark:border-[#5d7fb3] dark:bg-slate-900 md:p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Manage CMS Media</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use this library to upload, review, and safely manage media files used by your website customizations. Files currently used on the website are protected from deletion.
          </p>
          <div className="mt-5">
            <MediaLibraryPicker multiple={true} value={selectedMedia} onChange={setSelectedMedia} accept="image/*,video/*" folder="general" />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
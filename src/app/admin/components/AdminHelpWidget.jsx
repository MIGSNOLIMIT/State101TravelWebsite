"use client";

import { CircleHelp, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const HELP_CONTENT = [
  {
    match: (pathname) => pathname === "/admin/dashboard",
    title: "Dashboard Guide",
    intro: "This tab gives a quick summary of application activity.",
    items: [
      "Use the cards to monitor recent, in-review, approved, and declined applications.",
      "Editors can review dashboard metrics here, but only admins can manage application records.",
      "This page is meant for fast monitoring, not deep editing.",
    ],
  },
  {
    match: (pathname) => pathname === "/admin/reports",
    title: "Reports Guide",
    intro: "This tab shows monthly website traffic and application reporting.",
    items: [
      "Change the report year from the selector in the page header.",
      "Top Viewed Pages helps you see which public pages attract the most traffic.",
      "The Monthly Report Table is the compact summary for admin review.",
    ],
  },
  {
    match: (pathname) => pathname.startsWith("/admin/applications"),
    title: "Applications Guide",
    intro: "This tab is where admins review and manage applicant entries.",
    items: [
      "Switch status tabs to focus on each stage of the application flow.",
      "Use View Details to open files, update status, and remove records when needed.",
      "Workflow actions move applicants through the admin review process.",
    ],
  },
  {
    match: (pathname) => pathname === "/admin/edit/topbar",
    title: "Top Bar Guide",
    intro: "This tab updates the contact strip shown at the top of the public website.",
    items: [
      "Edit the address, phone numbers, and contact email that visitors see first.",
      "Save Changes publishes the new contact details to the website.",
      "Keep these fields accurate because they are often the first support details visitors use.",
    ],
  },
  {
    match: (pathname) => pathname === "/admin/edit/footer",
    title: "Footer Guide",
    intro: "This tab controls the contact details and social links in the website footer.",
    items: [
      "Update footer phone, email, and address information here.",
      "Use the social link fields for the exact public page URLs only.",
      "These values appear site-wide, so changes affect every public page.",
    ],
  },
  {
    match: (pathname) => pathname === "/admin/edit/home",
    title: "Home Page Guide",
    intro: "This tab controls the homepage media sections.",
    items: [
      "Hero images are shown in the opening section of the homepage.",
      "Successful client images and video appear in the testimonial media area.",
      "Save after checking that uploaded media matches the intended section.",
    ],
  },
  {
    match: (pathname) => pathname === "/admin/edit/services",
    title: "Services Page Guide",
    intro: "This tab manages the content visitors read on the services page.",
    items: [
      "Update the service descriptions carefully so requirements stay clear.",
      "Review text formatting before saving because this content is customer-facing.",
      "Use this section to keep visa and travel offerings accurate.",
    ],
  },
  {
    match: (pathname) => pathname === "/admin/edit/about",
    title: "About Page Guide",
    intro: "This tab updates the company story and public background details.",
    items: [
      "Use it for mission, vision, company story, and supporting media.",
      "Keep messaging aligned with the brand tone used across the public site.",
      "Review major text changes before publishing.",
    ],
  },
  {
    match: (pathname) => pathname === "/admin/edit/terms-of-service",
    title: "Terms Of Service Guide",
    intro: "This tab controls legal and policy content displayed to visitors.",
    items: [
      "Make updates carefully because this section affects public-facing legal copy.",
      "Use clear language and review formatting after editing.",
      "Coordinate legal wording changes before saving major revisions.",
    ],
  },
  {
    match: (pathname) => pathname === "/admin/profile",
    title: "Profile Guide",
    intro: "This tab lets you update your admin profile details.",
    items: [
      "Use the profile section for display name and password updates.",
      "Email editing is restricted based on role permissions.",
      "Enter the current password before saving password changes.",
    ],
  },
  {
    match: (pathname) => pathname === "/admin/edit/users",
    title: "Users Guide",
    intro: "This tab is for managing admin and editor accounts.",
    items: [
      "Use Add New User to create accounts with the correct role.",
      "Editing updates the user name and email only in the current interface.",
      "Remove with care because deleted users lose admin access immediately.",
    ],
  },
];

const HIDDEN_PATH_PREFIXES = [
  "/admin/portal/manage/state101signin",
  "/admin/forgot-password",
  "/admin/reset-password",
];

function getHelpConfig(pathname) {
  return HELP_CONTENT.find((entry) => entry.match(pathname)) || {
    title: "Admin Help",
    intro: "This page belongs to the admin workspace.",
    items: [
      "Use the left sidebar to move between dashboard, reports, website customization, and account tabs.",
      "Changes saved in admin usually affect the public website or internal records immediately.",
      "If you are unsure before saving, review the fields and workflow labels carefully first.",
    ],
  };
}

export default function AdminHelpWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hidden = HIDDEN_PATH_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  const help = useMemo(() => getHelpConfig(pathname || ""), [pathname]);

  if (!pathname?.startsWith("/admin") || hidden) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#2247df] text-white shadow-[0_16px_32px_rgba(34,71,223,0.34)] transition hover:scale-[1.03] hover:bg-[#1838bd]"
        aria-label="Open admin page help"
      >
        <CircleHelp size={28} strokeWidth={2.3} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/28 p-4 md:items-center md:justify-center md:p-6">
          <div className="w-full max-w-xl rounded-[28px] border border-[#dbe3ef] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#164896]">Help And Instructions</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{help.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{help.intro}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d6deea] text-slate-500 transition hover:bg-slate-50"
                aria-label="Close help"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {help.items.map((item) => (
                <div key={item} className="rounded-[18px] bg-[#f7f9fc] px-4 py-3 text-sm leading-6 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
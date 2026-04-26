"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileText,
  House,
  LayoutDashboard,
  LogOut,
  PencilLine,
  ScrollText,
  Search,
  UserCircle2,
  Users,
  XCircle,
} from "lucide-react";
import { APPLICATION_STATUS_ORDER, getApplicationStatusLabel, normalizeApplicationStatus } from "@/lib/application-status";
import BackupArchiveNotice from "./BackupArchiveNotice";

const primaryNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Applications", icon: FileText, adminOnly: true },
  { href: "/admin/applications?status=NEW", label: getApplicationStatusLabel("NEW", "nav"), icon: Clock3, status: "NEW", subItem: true, adminOnly: true },
  { href: "/admin/applications?status=IN_REVIEW", label: getApplicationStatusLabel("IN_REVIEW", "nav"), icon: Search, status: "IN_REVIEW", subItem: true, adminOnly: true },
  { href: "/admin/applications?status=SCHEDULED", label: getApplicationStatusLabel("SCHEDULED", "nav"), icon: Clock3, status: "SCHEDULED", subItem: true, adminOnly: true },
  { href: "/admin/applications?status=APPROVED", label: getApplicationStatusLabel("APPROVED", "nav"), icon: CheckCircle2, status: "APPROVED", subItem: true, adminOnly: true },
  { href: "/admin/applications?status=PENDING", label: getApplicationStatusLabel("PENDING", "nav"), icon: XCircle, status: "PENDING", subItem: true, adminOnly: true },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, adminOnly: true },
  { href: "/admin/logs", label: "Audit Logs", icon: ScrollText, adminOnly: true },
];

const customizationNav = [
  { href: "/admin/edit/topbar", label: "Top Bar", icon: FileText },
  { href: "/admin/edit/header-logo", label: "Header", icon: FileText },
  { href: "/admin/edit/footer", label: "Footer", icon: FileText },
  { href: "/admin/edit/home", label: "Home Page", icon: House },
  { href: "/admin/edit/services", label: "Services Page", icon: BriefcaseBusiness },
  { href: "/admin/edit/about", label: "About Us Page", icon: CircleHelp },
  { href: "/admin/edit/terms-of-service", label: "Terms of Service Page", icon: ScrollText },
];

const accountNav = [
  { href: "/admin/profile", label: "Edit Profile", icon: PencilLine },
  { href: "/admin/edit/users", label: "Users", icon: Users, adminOnly: true },
];

function isNavItemActive(item, pathname, searchParams) {
  if (item.status) {
    if (pathname !== "/admin/applications") return false;
    const currentStatus = normalizeApplicationStatus(searchParams.get("status") || APPLICATION_STATUS_ORDER[0]);
    return currentStatus === item.status;
  }
  if (item.href === "/admin/applications") {
    return pathname === "/admin/applications";
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarLink({ item, active, disabled = false }) {
  const Icon = item.icon;
  const layoutClass = item.subItem ? "ml-4 pl-4 text-[13px]" : "";

  if (disabled) {
    return (
      <div
        className={`flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/35 ${layoutClass}`}
        aria-disabled="true"
      >
        <Icon size={18} strokeWidth={2.1} />
        <span>{item.label}</span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={[
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${layoutClass}`,
        active
          ? "bg-[#0d255d] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          : "text-white/86 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      <Icon size={18} strokeWidth={2.1} />
      <span>{item.label}</span>
    </Link>
  );
}

export default function AdminShell({ children, title, userName, role }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const visiblePrimaryNav = primaryNav.filter((item) => !item.adminOnly || role === "admin");
  const visibleAccountNav = accountNav.filter((item) => !item.adminOnly || role === "admin");

  const onLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/portal/manage/state101signin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#ececec] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[126px] flex-col bg-[#164896] text-white shadow-[12px_0_30px_rgba(11,34,79,0.22)] md:w-[248px]">
        <div className="flex items-center gap-2 border-b border-white/20 px-3 py-3 md:px-4">
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-white">
            <Image src="/images/logo.png" alt="State 101 Travel" fill className="object-cover" sizes="36px" />
          </div>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-semibold">State 101 Travel</p>
          </div>
        </div>

        <div className="border-b border-white/16 px-3 py-4 text-center md:px-4 md:py-5">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#164896] shadow-lg md:h-24 md:w-24">
            <UserCircle2 size={58} strokeWidth={1.5} />
          </div>
          <p className="mt-3 truncate text-sm font-semibold md:text-base">{userName || "Admin User"}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">{role || "admin"}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 md:px-3">
          <div className="space-y-1">
            {visiblePrimaryNav.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={isNavItemActive(item, pathname, searchParams)}
              />
            ))}
          </div>

          <div className="mt-5 border-t border-white/12 pt-4">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55 md:text-[11px]">
              Website Customizations:
            </p>
            <div className="mt-2 space-y-1">
              {customizationNav.map((item) => (
                <SidebarLink key={item.href} item={item} active={isNavItemActive(item, pathname, searchParams)} />
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-white/12 pt-4">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55 md:text-[11px]">
              Profile Settings:
            </p>
            <div className="space-y-1">
              {visibleAccountNav.map((item) => (
                <SidebarLink key={item.href + item.label} item={item} active={isNavItemActive(item, pathname, searchParams)} />
              ))}
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-white/86 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut size={18} strokeWidth={2.1} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <div className="pl-[126px] md:pl-[248px]">
        <main className="p-4 md:p-6">
          <section className="mb-5 overflow-hidden rounded-[24px] bg-[#1f57a4] shadow-[0_14px_34px_rgba(15,23,42,0.16)]">
            <div className="px-5 py-5 md:px-6">
              <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-white">{title}</h1>
              <div className="mt-4 h-2 rounded-full bg-[#5d8ed3]" />
            </div>
          </section>

          {role === "admin" ? <BackupArchiveNotice /> : null}

          {children}
        </main>
      </div>
    </div>
  );
}

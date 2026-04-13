"use client";

import { usePathname } from "next/navigation";
import WebsiteViewTracker from "./WebsiteViewTracker";

export default function AppChrome({ children, topBar, header, footer, bottomBar, floatingChat }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isStandaloneSystemPage = pathname === "/access-denied";

  if (isAdminRoute || isStandaloneSystemPage) {
    return children;
  }

  return (
    <>
      <WebsiteViewTracker />
      {topBar}
      {header}
      <main className="flex-1">{children}</main>
      {footer}
      {bottomBar}
      {floatingChat}
    </>
  );
}
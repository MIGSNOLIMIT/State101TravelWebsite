export const dynamic = "force-dynamic";
export const revalidate = 0;

import AdminHelpWidget from "./components/AdminHelpWidget";

export default function AdminLayout({ children }) {
  return (
    <>
      {children}
      <AdminHelpWidget />
    </>
  );
}

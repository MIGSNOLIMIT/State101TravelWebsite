export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { canAccessAdminRoles, withEffectiveAdminRole } from "@/lib/admin-role";
import TermsOfServiceClient from "./TermsOfServiceClient";

export default async function EditTermsOfServicePage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/access-denied");
  }

  const user = withEffectiveAdminRole(await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, role: true },
  }));

  if (!user || !canAccessAdminRoles(user, ["admin", "editor"])) {
    redirect("/access-denied");
  }

  return <TermsOfServiceClient initialUserName={user.name || user.email || "Admin User"} initialRole={user.role} />;
}

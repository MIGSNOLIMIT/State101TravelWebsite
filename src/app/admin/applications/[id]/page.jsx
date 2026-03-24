export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import ApplicationDetailClient from "./ApplicationDetailClient";

export default async function ApplicationDetailPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/access-denied");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (!user || user.role !== "admin") {
    redirect("/access-denied");
  }

  return <ApplicationDetailClient />;
}

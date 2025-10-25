import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const footer = await prisma.footer.findFirst();
  return NextResponse.json(footer || {});
}

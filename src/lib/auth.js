import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const ADMIN_COOKIE_NAMES = ["admin_token", "admin-token"];

export async function getAdminSession() {
  const cookieStore = await cookies();

  const token = ADMIN_COOKIE_NAMES.map((name) => cookieStore.get(name)?.value).find(Boolean);
  if (!token) return null;

  try {
    const session = jwt.verify(token, process.env.JWT_SECRET);
    return session;
  } catch {
    return null;
  }
}

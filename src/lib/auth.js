import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    const session = jwt.verify(token, process.env.JWT_SECRET);
    return session;
  } catch {
    return null;
  }
}

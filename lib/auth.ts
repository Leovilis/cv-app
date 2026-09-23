// lib/auth.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const isAdminEmail = (email: string | null | undefined): boolean =>
  !!email && email === process.env.ADMIN_EMAIL;

/**
 * Verifica que haya sesión activa (cualquier usuario Google).
 * Retorna la sesión si es válida, o responde 401 y retorna null.
 */
export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    res.status(401).json({ error: "No autorizado" });
    return null;
  }
  return session;
}

/**
 * Verifica que haya sesión activa Y que el email sea el admin.
 * Retorna la sesión si es válida, o responde 401/403 y retorna null.
 */
export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    res.status(401).json({ error: "No autorizado" });
    return null;
  }
  if (!isAdminEmail(session.user.email)) {
    res.status(403).json({ error: "Acceso denegado" });
    return null;
  }
  return session;
}

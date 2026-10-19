// pages/api/cv/update-review.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/auth";
import { getFirestore } from "@/lib/firebase-admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  try {
    const { cvId } = req.body;
    if (!cvId) {
      return res.status(400).json({ error: "Falta el ID del CV" });
    }

    const db = getFirestore();
    await db.collection("cvs").doc(cvId).update({
      fechaUltimaRevision: new Date().toISOString(),
      revisadoPor: session.user.email,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error al registrar revisión" });
  }
}

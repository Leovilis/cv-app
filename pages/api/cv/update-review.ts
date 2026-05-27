// pages/api/cv/update-review.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getFirestore } from "@/lib/firebase-admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "No autorizado" });
  }

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

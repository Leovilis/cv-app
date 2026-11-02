// pages/api/cv/latest.ts
// Devuelve solo los CVs cargados después de `since` (fecha ISO).
// Lo usa el panel de admin para mostrar CVs nuevos sin releer toda la colección.
// Si no hay CVs nuevos, la consulta cuesta 1 lectura de Firestore.
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/auth";
import { getFirestore } from "@/lib/firebase-admin";
import { CV } from "@/lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireAdmin(req, res);
  if (!session) return;

  const since = Array.isArray(req.query.since) ? req.query.since[0] : req.query.since;
  if (!since || isNaN(new Date(since).getTime())) {
    return res.status(400).json({ error: "Parámetro 'since' inválido" });
  }

  try {
    const snapshot = await getFirestore()
      .collection("cvs")
      .where("uploadedAt", ">", since)
      .orderBy("uploadedAt", "desc")
      .limit(200)
      .get();

    const cvs: CV[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<CV, "id">),
    }));

    return res.status(200).json({ cvs });
  } catch (error) {
    console.error("❌ Error al buscar CVs nuevos:", error);
    return res.status(500).json({ error: "Error al buscar CVs nuevos" });
  }
}

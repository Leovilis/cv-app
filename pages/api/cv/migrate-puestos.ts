// pages/api/cv/migrate-puestos.ts
// ⚠️ Endpoint de uso único: unifica puestos MAYÚSCULAS/minúsculas en la base.
// Uso (logueado como admin, desde la consola del navegador en el panel):
//   Vista previa: fetch('/api/cv/migrate-puestos?dryRun=1', {method:'POST'}).then(r=>r.json()).then(console.log)
//   Aplicar:      fetch('/api/cv/migrate-puestos', {method:'POST'}).then(r=>r.json()).then(console.log)
// Eliminar este archivo una vez ejecutado.
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/auth";
import { getFirestore } from "@/lib/firebase-admin";
import { dedupePuestos, limpiarPuesto, puestoKey } from "@/lib/puestos";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const session = await requireAdmin(req, res);
  if (!session) return;

  const dryRun = req.query.dryRun === "1";
  const db = getFirestore();
  const cambios: { coleccion: string; id: string; campo: string; de: string; a: string }[] = [];

  try {
    // 1) Áreas: eliminar duplicados de puestos (se conserva la versión en minúsculas)
    const areasSnap = await db.collection("areas").get();
    const canonico = new Map<string, string>(); // clave → nombre final
    for (const doc of areasSnap.docs) {
      const actuales: string[] = doc.data().puestos || [];
      const nuevos = dedupePuestos(actuales);
      nuevos.forEach((p) => canonico.set(puestoKey(p), p));
      if (JSON.stringify(actuales) !== JSON.stringify(nuevos)) {
        cambios.push({ coleccion: "areas", id: doc.id, campo: "puestos", de: actuales.join(" | "), a: nuevos.join(" | ") });
        if (!dryRun) await doc.ref.update({ puestos: nuevos });
      }
    }

    const normalizar = (v: string | undefined | null) => {
      if (!v) return v ?? "";
      return canonico.get(puestoKey(v)) || limpiarPuesto(v);
    };

    // 2) Búsquedas activas
    const busqSnap = await db.collection("busquedas_activas").get();
    for (const doc of busqSnap.docs) {
      const p = doc.data().puesto;
      const n = normalizar(p);
      if (p && n !== p) {
        cambios.push({ coleccion: "busquedas_activas", id: doc.id, campo: "puesto", de: p, a: n });
        if (!dryRun) await doc.ref.update({ puesto: n });
      }
    }

    // 3) CVs
    const cvSnap = await db.collection("cvs").get();
    for (const doc of cvSnap.docs) {
      const d = doc.data();
      const update: Record<string, any> = {};
      for (const campo of ["subArea", "puestoSeleccionado"]) {
        const v = d[campo];
        const n = normalizar(v);
        if (v && n !== v) {
          update[campo] = n;
          cambios.push({ coleccion: "cvs", id: doc.id, campo, de: v, a: n });
        }
      }
      if (Array.isArray(d.busquedasInfo)) {
        let cambio = false;
        const info = d.busquedasInfo.map((b: any) => {
          const n = normalizar(b?.puesto);
          if (b?.puesto && n !== b.puesto) {
            cambio = true;
            cambios.push({ coleccion: "cvs", id: doc.id, campo: "busquedasInfo.puesto", de: b.puesto, a: n });
            return { ...b, puesto: n };
          }
          return b;
        });
        if (cambio) update.busquedasInfo = info;
      }
      if (Object.keys(update).length && !dryRun) await doc.ref.update(update);
    }

    return res.status(200).json({ success: true, dryRun, totalCambios: cambios.length, cambios });
  } catch (error: any) {
    console.error("❌ Error en migración de puestos:", error);
    return res.status(500).json({ error: "Error en la migración" });
  }
}

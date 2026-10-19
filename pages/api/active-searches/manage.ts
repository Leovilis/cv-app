// pages/api/active-searches/manage.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/auth";
import { getFirestore } from "@/lib/firebase-admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const db = getFirestore();
  const { method } = req;

  // GET - Obtener una búsqueda específica
  if (method === "GET") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Se requiere ID" });
    }

    try {
      const doc = await db
        .collection("busquedas_activas")
        .doc(id as string)
        .get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Búsqueda no encontrada" });
      }
      return res.status(200).json({ busqueda: { id: doc.id, ...doc.data() } });
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener la búsqueda" });
    }
  }

  // POST - Crear nueva búsqueda
  if (method === "POST") {
    const {
      titulo,
      area,
      puesto,
      lugarResidencia,
      acercaDelPuesto,
      principalesResponsabilidades,
      requisitos,
    } = req.body;

    if (!titulo || !area || !puesto || !lugarResidencia) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    try {
      const nuevaBusqueda = {
        titulo,
        area,
        puesto,
        lugarResidencia,
        acercaDelPuesto: acercaDelPuesto || "",
        principalesResponsabilidades: principalesResponsabilidades || "",
        requisitos: requisitos || "",
        activa: true,
        creadaAt: new Date().toISOString(),
        creadaPor: session.user.email,
      };

      const docRef = await db
        .collection("busquedas_activas")
        .add(nuevaBusqueda);
      return res.status(200).json({
        success: true,
        id: docRef.id,
        message: "Búsqueda creada exitosamente",
      });
    } catch (error) {
      return res.status(500).json({ error: "Error al crear la búsqueda" });
    }
  }

  // PUT - Actualizar búsqueda
  if (method === "PUT") {
    const {
      id,
      titulo,
      area,
      puesto,
      lugarResidencia,
      activa,
      acercaDelPuesto,
      principalesResponsabilidades,
      requisitos,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Se requiere ID" });
    }

    try {
      const updateData: any = {};
      if (titulo !== undefined) updateData.titulo = titulo;
      if (area !== undefined) updateData.area = area;
      if (puesto !== undefined) updateData.puesto = puesto;
      if (lugarResidencia !== undefined)
        updateData.lugarResidencia = lugarResidencia;
      if (activa !== undefined) updateData.activa = activa;
      if (acercaDelPuesto !== undefined)
        updateData.acercaDelPuesto = acercaDelPuesto;
      if (principalesResponsabilidades !== undefined)
        updateData.principalesResponsabilidades = principalesResponsabilidades;
      if (requisitos !== undefined) updateData.requisitos = requisitos;
      updateData.actualizadaAt = new Date().toISOString();
      updateData.actualizadaPor = session.user.email;

      await db.collection("busquedas_activas").doc(id).update(updateData);
      return res
        .status(200)
        .json({ success: true, message: "Búsqueda actualizada" });
    } catch (error) {
      return res.status(500).json({ error: "Error al actualizar la búsqueda" });
    }
  }

  // DELETE - Eliminar (desactivar) búsqueda
  if (method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Se requiere ID" });
    }

    try {
      // En lugar de eliminar, marcamos como inactiva
      await db
        .collection("busquedas_activas")
        .doc(id as string)
        .update({
          activa: false,
          desactivadaAt: new Date().toISOString(),
          desactivadaPor: session.user.email,
        });
      return res
        .status(200)
        .json({ success: true, message: "Búsqueda desactivada" });
    } catch (error) {
      return res.status(500).json({ error: "Error al desactivar la búsqueda" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

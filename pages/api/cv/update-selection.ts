// pages/api/cv/update-selection.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getFirestore } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

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
  if (session.user.email !== "sistemas@ddonpedrosrl.com") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  try {
    const {
      cvId,
      accion,
      // Selección
      puestoSeleccionado,
      estadoSeleccion,
      notasAdmin,
      motivoDescarte,
      areaAsignada,
      // Campos parciales
      referenciasLaborales,
      prioridadTerna,
      // Exámenes
      examenFisico,
      examenFisicoFecha,
      examenFisicoNotas,
      examenFisicoResultado,
      examenPsicotecnico,
      examenPsicotecnicoFecha,
      examenPsicotecnicoNotas,
      examenPsicotecnicoResultado,
    } = req.body;

    if (!cvId) return res.status(400).json({ error: "Falta el ID del CV" });

    const db = getFirestore();
    const cvRef = db.collection("cvs").doc(cvId);
    const cvDoc = await cvRef.get();
    if (!cvDoc.exists)
      return res.status(404).json({ error: "CV no encontrado" });

    const currentData = cvDoc.data()!;

    if (accion === "reactivar") {
      // Obtener el motivo de descarte actual (el que se guardó cuando se descartó)
      const motivoAnterior =
        currentData.motivoDescarte || "Sin motivo registrado";
      const fechaAnterior =
        currentData.fechaSeleccion || new Date().toISOString();
      const notasAnteriores = currentData.notasAdmin || "";

      // Registrar en historial el descarte anterior (para trazabilidad)
      const entradaHistorialDescarte = {
        estado: currentData.estadoSeleccion || "Descartado",
        fecha: fechaAnterior,
        motivo: motivoAnterior,
        notas: notasAnteriores,
        realizadoPor: session.user.email,
      };

      // Registrar en historial la reactivación
      const entradaHistorialReactivacion = {
        estado: "Reactivado",
        fecha: new Date().toISOString(),
        motivo: `Reactivado desde ${currentData.estadoSeleccion || "Descartado"} - Motivo original: ${motivoAnterior}`,
        notas: `El candidato fue reactivado. Motivo de descarte anterior: ${motivoAnterior}`,
        realizadoPor: session.user.email,
      };

      await cvRef.update({
        puestoSeleccionado: "",
        estadoSeleccion: "En Curso",
        notasAdmin: "",
        fechaSeleccion: new Date().toISOString(),
        motivoDescarte: "",
        repostulacionDescartado: true,
        motivoDescarteAnterior: motivoAnterior,
        fechaDescarteAnterior: fechaAnterior,
        fechaReactivacion: new Date().toISOString(),
        notasReactivacion: `Reactivado por ${session.user.email}. Motivo anterior: ${motivoAnterior}`,
        // Limpiar exámenes
        examenFisico: false,
        examenFisicoFecha: null,
        examenFisicoNotas: "",
        examenFisicoResultado: "",
        examenPsicotecnico: false,
        examenPsicotecnicoFecha: null,
        examenPsicotecnicoNotas: "",
        examenPsicotecnicoResultado: "",
        // Limpiar puntuaciones
        puntuacionRRHH: null,
        puntuacionAreaTecnica: null,
        fechaEntrevistaRRHH: null,
        fechaEntrevistaAreaTecnica: null,
        // Agregar al historial
        historialEstados: FieldValue.arrayUnion(
          entradaHistorialDescarte,
          entradaHistorialReactivacion,
        ),
      });

      return res.status(200).json({
        success: true,
        message: `Candidato reactivado exitosamente. Motivo de descarte anterior: ${motivoAnterior}`,
      });
    }

    // ── ACTUALIZACIÓN PARCIAL — campos que no requieren puesto/estado ─────────
    if (referenciasLaborales !== undefined) {
      await cvRef.update({ referenciasLaborales });
      return res
        .status(200)
        .json({ success: true, message: "Referencias guardadas" });
    }

    if (prioridadTerna !== undefined) {
      await cvRef.update({ prioridadTerna });
      return res
        .status(200)
        .json({ success: true, message: "Prioridad guardada" });
    }

    // Exámenes
    if (examenFisico !== undefined || examenPsicotecnico !== undefined) {
      const updateData: Record<string, any> = {};
      if (examenFisico !== undefined) {
        updateData.examenFisico = examenFisico;
        updateData.examenFisicoFecha =
          examenFisicoFecha || new Date().toISOString();
        updateData.examenFisicoNotas = examenFisicoNotas || "";
        updateData.examenFisicoResultado = examenFisicoResultado || "";
      }
      if (examenPsicotecnico !== undefined) {
        updateData.examenPsicotecnico = examenPsicotecnico;
        updateData.examenPsicotecnicoFecha =
          examenPsicotecnicoFecha || new Date().toISOString();
        updateData.examenPsicotecnicoNotas = examenPsicotecnicoNotas || "";
        updateData.examenPsicotecnicoResultado =
          examenPsicotecnicoResultado || "";
      }
      await cvRef.update(updateData);
      return res
        .status(200)
        .json({ success: true, message: "Examen actualizado" });
    }

    // ── QUITAR del proceso (limpiar todo) ─────────────────────────────────────
    const isClearing = puestoSeleccionado === "" && estadoSeleccion === "";

    if (!isClearing && (!puestoSeleccionado || !estadoSeleccion)) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    if (isClearing) {
      const entradaHistorial = {
        estado: "Quitado del Proceso",
        fecha: new Date().toISOString(),
        motivo: "Eliminado del proceso de selección",
        notas: notasAdmin || "",
        realizadoPor: session.user.email,
      };

      await cvRef.update({
        puestoSeleccionado: "",
        estadoSeleccion: "Quitado del Proceso",
        notasAdmin: notasAdmin || "",
        fechaSeleccion: new Date().toISOString(),
        motivoDescarte: "Eliminado del proceso de selección",
        historialEstados: FieldValue.arrayUnion(entradaHistorial),
      });
      return res
        .status(200)
        .json({
          success: true,
          message: "CV removido del proceso de selección",
        });
    }

    // ── ACTUALIZAR estado de selección ────────────────────────────────────────
    const updateData: Record<string, any> = {
      puestoSeleccionado,
      estadoSeleccion,
      notasAdmin: notasAdmin || "",
      fechaSeleccion: new Date().toISOString(),
    };

    // Si se envió areaAsignada, actualizarla
    if (areaAsignada !== undefined && areaAsignada !== "") {
      updateData.areaAsignada = areaAsignada;
    }

    // Guardar en historial el cambio de estado
    const entradaHistorial: any = {
      estado: estadoSeleccion,
      fecha: new Date().toISOString(),
      notas: notasAdmin || "",
      realizadoPor: session.user.email,
    };

    if (estadoSeleccion === "Descartado") {
      updateData.motivoDescarte = motivoDescarte || "";
      entradaHistorial.motivo = motivoDescarte || "";
    } else {
      updateData.motivoDescarte = "";
    }

    // Registrar fechas específicas según el estado
    if (estadoSeleccion === "Entrevista RRHH") {
      updateData.fechaEntrevistaRRHH = new Date().toISOString();
    } else if (estadoSeleccion === "Entrevista Área Técnica") {
      updateData.fechaEntrevistaAreaTecnica = new Date().toISOString();
    }

    updateData.historialEstados = FieldValue.arrayUnion(entradaHistorial);
    await cvRef.update(updateData);

    console.log("✅ Selección actualizada:", cvId, "→", estadoSeleccion);
    return res
      .status(200)
      .json({ success: true, message: "Selección actualizada exitosamente" });
  } catch (error: any) {
    console.error("❌ Error al actualizar selección:", error);
    return res.status(500).json({
      error: "Error al actualizar la selección",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

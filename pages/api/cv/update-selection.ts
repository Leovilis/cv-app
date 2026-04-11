// pages/api/cv/update-selection.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  if (session.user.email !== 'sistemas@ddonpedrosrl.com') {
    return res.status(403).json({ error: 'Acceso denegado' });
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
      // Campos parciales (no requieren puesto/estado)
      referenciasLaborales,
      prioridadTerna,
      // Exámenes
      examenFisico,        examenFisicoFecha,        examenFisicoNotas,        examenFisicoResultado,
      examenPsicotecnico,  examenPsicotecnicoFecha,  examenPsicotecnicoNotas,  examenPsicotecnicoResultado,
    } = req.body;

    if (!cvId) return res.status(400).json({ error: 'Falta el ID del CV' });

    const db    = getFirestore();
    const cvRef = db.collection('cvs').doc(cvId);
    const cvDoc = await cvRef.get();
    if (!cvDoc.exists) return res.status(404).json({ error: 'CV no encontrado' });

    const currentData = cvDoc.data()!;

    // ── REACTIVAR candidato descartado ────────────────────────────────────────
    if (accion === 'reactivar') {
      const motivoAnterior = currentData.motivoDescarte || 'Sin motivo registrado';
      const entradaHistorial = {
        estado: currentData.estadoSeleccion || 'Descartado',
        fecha:  new Date().toISOString(),
        motivo: motivoAnterior,
        notas:  currentData.notasAdmin || '',
        realizadoPor: session.user.email,
      };
      await cvRef.update({
        puestoSeleccionado:      '',
        estadoSeleccion:         '',
        notasAdmin:              '',
        fechaSeleccion:          '',
        motivoDescarte:          '',
        repostulacionDescartado: true,
        motivoDescarteAnterior:  motivoAnterior,
        historialEstados:        FieldValue.arrayUnion(entradaHistorial),
      });
      return res.status(200).json({ success: true, message: 'Candidato reactivado exitosamente' });
    }

    // ── ACTUALIZACIÓN PARCIAL — campos que no requieren puesto/estado ─────────
    // Referencias laborales
    if (referenciasLaborales !== undefined) {
      await cvRef.update({ referenciasLaborales });
      return res.status(200).json({ success: true, message: 'Referencias guardadas' });
    }

    // Prioridad en terna
    if (prioridadTerna !== undefined) {
      await cvRef.update({ prioridadTerna });
      return res.status(200).json({ success: true, message: 'Prioridad guardada' });
    }

    // Exámenes
    if (examenFisico !== undefined || examenPsicotecnico !== undefined) {
      const updateData: Record<string, any> = {};
      if (examenFisico !== undefined) {
        updateData.examenFisico              = examenFisico;
        updateData.examenFisicoFecha         = examenFisicoFecha || new Date().toISOString();
        updateData.examenFisicoNotas         = examenFisicoNotas || '';
        updateData.examenFisicoResultado     = examenFisicoResultado || '';
      }
      if (examenPsicotecnico !== undefined) {
        updateData.examenPsicotecnico        = examenPsicotecnico;
        updateData.examenPsicotecnicoFecha   = examenPsicotecnicoFecha || new Date().toISOString();
        updateData.examenPsicotecnicoNotas   = examenPsicotecnicoNotas || '';
        updateData.examenPsicotecnicoResultado = examenPsicotecnicoResultado || '';
      }
      await cvRef.update(updateData);
      return res.status(200).json({ success: true, message: 'Examen actualizado' });
    }

    // ── QUITAR del proceso (limpiar todo) ─────────────────────────────────────
    const isClearing = puestoSeleccionado === '' && estadoSeleccion === '';

    if (!isClearing && (!puestoSeleccionado || !estadoSeleccion)) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (isClearing) {
      // Guardar en historial que se quitó del proceso
      const entradaHistorial = {
        estado: 'Quitado del Proceso',
        fecha: new Date().toISOString(),
        motivo: 'Eliminado del proceso de selección',
        notas: notasAdmin || '',
        realizadoPor: session.user.email,
      };
      
      await cvRef.update({
        puestoSeleccionado: '',
        estadoSeleccion:    'Quitado del Proceso',
        notasAdmin:         notasAdmin || '',
        fechaSeleccion:     new Date().toISOString(),
        motivoDescarte:     'Eliminado del proceso de selección',
        historialEstados:   FieldValue.arrayUnion(entradaHistorial),
      });
      return res.status(200).json({ success: true, message: 'CV removido del proceso de selección' });
    }

    // ── ACTUALIZAR estado de selección ────────────────────────────────────────
    const updateData: Record<string, any> = {
      puestoSeleccionado,
      estadoSeleccion,
      notasAdmin:     notasAdmin || '',
      fechaSeleccion: new Date().toISOString(),
    };

    // Guardar en historial el cambio de estado
    const entradaHistorial: any = {
      estado: estadoSeleccion,
      fecha:  new Date().toISOString(),
      notas:  notasAdmin || '',
      realizadoPor: session.user.email,
    };

    if (estadoSeleccion === 'Descartado') {
      updateData.motivoDescarte = motivoDescarte || '';
      entradaHistorial.motivo = motivoDescarte || '';
    } else {
      updateData.motivoDescarte = '';
    }

    updateData.historialEstados = FieldValue.arrayUnion(entradaHistorial);
    await cvRef.update(updateData);

    console.log('✅ Selección actualizada:', cvId, '→', estadoSeleccion);
    return res.status(200).json({ success: true, message: 'Selección actualizada exitosamente' });

  } catch (error: any) {
    console.error('❌ Error al actualizar selección:', error);
    return res.status(500).json({
      error: 'Error al actualizar la selección',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
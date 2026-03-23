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
    const { cvId, puestoSeleccionado, estadoSeleccion, notasAdmin, motivoDescarte, accion } = req.body;

    if (!cvId) return res.status(400).json({ error: 'Falta el ID del CV' });

    const db    = getFirestore();
    const cvRef = db.collection('cvs').doc(cvId);
    const cvDoc = await cvRef.get();

    if (!cvDoc.exists) return res.status(404).json({ error: 'CV no encontrado' });

    const currentData = cvDoc.data()!;

    // ── REACTIVAR candidato descartado ────────────────────────────────────────
    if (accion === 'reactivar') {
      const motivoAnterior = currentData.motivoDescarte || 'Sin motivo registrado';
      const estadoAnterior = currentData.estadoSeleccion || 'Descartado';

      // Agregar al historial antes de limpiar
      const entradaHistorial = {
        estado:  estadoAnterior,
        fecha:   new Date().toISOString(),
        motivo:  motivoAnterior,
        notas:   currentData.notasAdmin || '',
      };

      await cvRef.update({
        // Limpiar estado actual — vuelve a "Todos los CVs"
        puestoSeleccionado: '',
        estadoSeleccion:    '',
        notasAdmin:         '',
        fechaSeleccion:     '',
        motivoDescarte:     '',
        // Mantener banda de advertencia visible con el motivo anterior
        repostulacionDescartado: true,
        motivoDescarteAnterior:  motivoAnterior,
        // Acumular en historial
        historialEstados: FieldValue.arrayUnion(entradaHistorial),
      });

      console.log('✅ Candidato reactivado desde Descartados:', cvId, '| Motivo anterior:', motivoAnterior);
      return res.status(200).json({ success: true, message: 'Candidato reactivado exitosamente' });
    }

    // ── QUITAR del proceso (limpiar todo) ─────────────────────────────────────
    const isClearing = puestoSeleccionado === '' && estadoSeleccion === '';

    if (!isClearing && (!puestoSeleccionado || !estadoSeleccion)) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (isClearing) {
      await cvRef.update({
        puestoSeleccionado: '',
        estadoSeleccion:    '',
        notasAdmin:         '',
        fechaSeleccion:     '',
        motivoDescarte:     '',
      });
      console.log('✅ CV removido del proceso:', cvId);
      return res.status(200).json({ success: true, message: 'CV removido del proceso de selección' });
    }

    // ── ACTUALIZAR estado ─────────────────────────────────────────────────────
    const updateData: Record<string, any> = {
      puestoSeleccionado,
      estadoSeleccion,
      notasAdmin:    notasAdmin || '',
      fechaSeleccion: new Date().toISOString(),
    };

    if (estadoSeleccion === 'Descartado') {
      updateData.motivoDescarte = motivoDescarte || '';
      // Guardar entrada en historial
      updateData.historialEstados = FieldValue.arrayUnion({
        estado: 'Descartado',
        fecha:  new Date().toISOString(),
        motivo: motivoDescarte || '',
        notas:  notasAdmin || '',
      });
      console.log('🚫 Candidato descartado:', cvId, '| Motivo:', motivoDescarte);
    } else {
      updateData.motivoDescarte = '';
    }

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
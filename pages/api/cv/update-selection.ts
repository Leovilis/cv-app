import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    const { cvId, puestoSeleccionado, estadoSeleccion, notasAdmin, motivoDescarte } = req.body;

    if (!cvId) {
      return res.status(400).json({ error: 'Falta el ID del CV' });
    }

    // Quitar del proceso (vaciar todo)
    const isClearing = puestoSeleccionado === '' && estadoSeleccion === '';

    if (!isClearing && (!puestoSeleccionado || !estadoSeleccion)) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const db = getFirestore();
    const cvDoc = await db.collection('cvs').doc(cvId).get();

    if (!cvDoc.exists) {
      return res.status(404).json({ error: 'CV no encontrado' });
    }

    if (isClearing) {
      await db.collection('cvs').doc(cvId).update({
        puestoSeleccionado: '',
        estadoSeleccion:    '',
        notasAdmin:         '',
        fechaSeleccion:     '',
        motivoDescarte:     '',
      });
      console.log('✅ CV removido del proceso:', cvId);
      return res.status(200).json({ success: true, message: 'CV removido del proceso de selección' });
    }

    // Construcción del objeto de actualización
    const updateData: Record<string, any> = {
      puestoSeleccionado,
      estadoSeleccion,
      notasAdmin: notasAdmin || '',
      fechaSeleccion: new Date().toISOString(),
    };

    // Si se está descartando, guardar el motivo en el documento
    if (estadoSeleccion === 'Descartado') {
      updateData.motivoDescarte = motivoDescarte || '';
      console.log('🚫 Candidato descartado. Motivo:', motivoDescarte);
    } else {
      // Limpiar motivo si se reactiva (caso borde)
      updateData.motivoDescarte = '';
    }

    await db.collection('cvs').doc(cvId).update(updateData);

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
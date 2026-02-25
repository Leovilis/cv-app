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
    const { cvId, puestoSeleccionado, estadoSeleccion, notasAdmin } = req.body;

    if (!cvId) {
      return res.status(400).json({ error: 'Falta el ID del CV' });
    }

    // Si puestoSeleccionado y estadoSeleccion son strings vacíos, se está
    // quitando el CV del proceso de selección (lo devuelve a la lista general).
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
      // Borrar campos de selección usando FieldValue.delete() vía update con
      // valores vacíos — Firestore permite sobreescribir con '' para limpiarlos.
      await db.collection('cvs').doc(cvId).update({
        puestoSeleccionado: '',
        estadoSeleccion: '',
        notasAdmin: '',
        fechaSeleccion: '',
      });

      console.log('✅ CV removido del proceso de selección:', cvId);
      return res.status(200).json({
        success: true,
        message: 'CV removido del proceso de selección',
      });
    }

    const updateData = {
      puestoSeleccionado,
      estadoSeleccion,
      notasAdmin: notasAdmin || '',
      fechaSeleccion: new Date().toISOString(),
    };

    await db.collection('cvs').doc(cvId).update(updateData);

    console.log('✅ Selección actualizada exitosamente');
    return res.status(200).json({
      success: true,
      message: 'Selección actualizada exitosamente',
    });

  } catch (error: any) {
    console.error('❌ Error al actualizar selección:', error);
    return res.status(500).json({
      error: 'Error al actualizar la selección',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
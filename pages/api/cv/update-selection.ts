import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase';

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

    if (!cvId || !puestoSeleccionado || !estadoSeleccion) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const db = getFirestore();

    await db.collection('cvs').doc(cvId).update({
      puestoSeleccionado,
      estadoSeleccion,
      notasAdmin: notasAdmin || '',
      fechaSeleccion: new Date().toISOString(),
    });

    return res.status(200).json({ 
      success: true,
      message: 'Selección actualizada exitosamente',
    });

  } catch (error: any) {
    console.error('Error al actualizar selección:', error);
    return res.status(500).json({ 
      error: 'Error al actualizar la selección',
      details: error.message 
    });
  }
}
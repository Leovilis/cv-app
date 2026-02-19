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

    console.log('📝 Actualizando selección de CV:', cvId);

    if (!cvId || !puestoSeleccionado || !estadoSeleccion) {
      console.error('❌ Faltan datos requeridos');
      console.error('cvId:', cvId);
      console.error('puestoSeleccionado:', puestoSeleccionado);
      console.error('estadoSeleccion:', estadoSeleccion);
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const db = getFirestore();

    // Verificar que el CV existe
    const cvDoc = await db.collection('cvs').doc(cvId).get();
    
    if (!cvDoc.exists) {
      console.error('❌ CV no encontrado:', cvId);
      return res.status(404).json({ error: 'CV no encontrado' });
    }

    console.log('📄 CV encontrado, actualizando...');
    console.log('📌 Puesto:', puestoSeleccionado);
    console.log('📊 Estado:', estadoSeleccion);
    console.log('📝 Notas:', notasAdmin || '(sin notas)');

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
    console.error('❌ Stack trace:', error.stack);
    return res.status(500).json({ 
      error: 'Error al actualizar la selección',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
// pages/api/cv/update-ranking.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';
import { HistorialInstancia } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.email !== 'sistemas@ddonpedrosrl.com') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { cvId, tipo, puntuacion, notas } = req.body;

  if (!cvId || !tipo || puntuacion === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  if (puntuacion < 1 || puntuacion > 10) {
    return res.status(400).json({ error: 'La puntuación debe ser entre 1 y 10' });
  }

  try {
    const db = getFirestore();
    const cvRef = db.collection('cvs').doc(cvId);
    const cvDoc = await cvRef.get();

    if (!cvDoc.exists) {
      return res.status(404).json({ error: 'CV no encontrado' });
    }

    const cvData = cvDoc.data();
    const historialActual: HistorialInstancia[] = cvData?.historialInstancias || [];

    // Crear nuevo historial
    const nuevaInstancia: HistorialInstancia = {
      id: uuidv4(),
      fecha: new Date().toISOString(),
      instancia: tipo === 'RRHH' ? 'ENTREVISTA_RRHH' : 'ENTREVISTA_AREA_TECNICA',
      puntuacion,
      notas: notas || '',
      realizadoPor: session.user.email!
    };

    const nuevoHistorial = [...historialActual, nuevaInstancia];

    // Actualizar campos según tipo
    const updateData: any = {
      historialInstancias: nuevoHistorial
    };

    if (tipo === 'RRHH') {
      updateData.puntuacionRRHH = puntuacion;
      updateData.fechaEntrevistaRRHH = new Date().toISOString();
    } else {
      updateData.puntuacionAreaTecnica = puntuacion;
      updateData.fechaEntrevistaAreaTecnica = new Date().toISOString();
    }

    await cvRef.update(updateData);

    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Error al actualizar ranking:', error);
    return res.status(500).json({ error: error.message });
  }
}
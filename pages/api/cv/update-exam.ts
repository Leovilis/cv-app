// pages/api/cv/update-exam.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';

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
      examenFisico,        examenFisicoFecha,        examenFisicoNotas,
      examenPsicotecnico,  examenPsicotecnicoFecha,  examenPsicotecnicoNotas,
    } = req.body;

    if (!cvId) return res.status(400).json({ error: 'Falta el ID del CV' });

    const db     = getFirestore();
    const cvDoc  = await db.collection('cvs').doc(cvId).get();
    if (!cvDoc.exists) return res.status(404).json({ error: 'CV no encontrado' });

    const updateData: Record<string, any> = {};

    if (examenFisico !== undefined) {
      updateData.examenFisico       = examenFisico;
      updateData.examenFisicoFecha  = examenFisicoFecha || new Date().toISOString();
      updateData.examenFisicoNotas  = examenFisicoNotas || '';
      console.log('🔬 Examen físico registrado para CV:', cvId);
    }

    if (examenPsicotecnico !== undefined) {
      updateData.examenPsicotecnico      = examenPsicotecnico;
      updateData.examenPsicotecnicoFecha = examenPsicotecnicoFecha || new Date().toISOString();
      updateData.examenPsicotecnicoNotas = examenPsicotecnicoNotas || '';
      console.log('🧠 Examen psicotécnico registrado para CV:', cvId);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No se enviaron datos de examen' });
    }

    await db.collection('cvs').doc(cvId).update(updateData);

    return res.status(200).json({ success: true, message: 'Examen registrado exitosamente' });

  } catch (error: any) {
    console.error('❌ Error al registrar examen:', error);
    return res.status(500).json({
      error: 'Error al registrar el examen',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
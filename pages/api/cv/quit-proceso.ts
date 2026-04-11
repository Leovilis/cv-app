// pages/api/cv/quit-proceso.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';
import { HistorialInstancia } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const MOTIVOS_QUITAR_PROCESO = [
  'No cumple con el perfil requerido',
  'Actitud no apta durante el proceso',
  'Malas Referencias',
  'Rechazó oferta',
  'Declinó la oferta',
  'No se presentó a la entrevista',
  'Información falsa o inconsistente',
  'Perfil sobrecalificado',
  'Perfil insuficiente',
  'Cambio de requisitos del puesto',
  'Otro motivo'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.email !== 'sistemas@ddonpedrosrl.com') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { cvId, motivo, notas } = req.body;

  if (!cvId || !motivo) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  if (!MOTIVOS_QUITAR_PROCESO.includes(motivo) && motivo !== 'Otro motivo') {
    return res.status(400).json({ error: 'Motivo no válido' });
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

    // Crear nueva instancia de QUITADO_PROCESO
    const nuevaInstancia: HistorialInstancia = {
      id: uuidv4(),
      fecha: new Date().toISOString(),
      instancia: 'QUITADO_PROCESO',
      motivo,
      notas: notas || '',
      realizadoPor: session.user.email!
    };

    const nuevoHistorial = [...historialActual, nuevaInstancia];

    await cvRef.update({
      estadoSeleccion: 'Quitado del Proceso',
      motivoQuitadoProceso: motivo,
      fechaQuitadoProceso: new Date().toISOString(),
      notasAdmin: notas || cvData?.notasAdmin || '',
      historialInstancias: nuevoHistorial
    });

    return res.status(200).json({ success: true, motivos: MOTIVOS_QUITAR_PROCESO });

  } catch (error: any) {
    console.error('Error al quitar del proceso:', error);
    return res.status(500).json({ error: error.message });
  }
}
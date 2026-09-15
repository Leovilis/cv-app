// pages/api/cv/mark-revisado.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'No autorizado' });
  if (session.user.email !== process.env.ADMIN_EMAIL)
    return res.status(403).json({ error: 'Acceso denegado' });

  const { cvId } = req.body;
  if (!cvId) return res.status(400).json({ error: 'Falta el ID del CV' });

  try {
    const db = getFirestore();
    const doc = await db.collection('cvs').doc(cvId).get();
    if (!doc.exists) return res.status(404).json({ error: 'CV no encontrado' });

    // Solo marcar si aún no fue revisado
    if (!doc.data()?.revisado) {
      await db.collection('cvs').doc(cvId).update({
        revisado:   true,
        revisadoAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al marcar como revisado', details: error.message });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';
import { CV } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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
    const area = Array.isArray(req.query.area) ? req.query.area[0] : req.query.area;
    const formacion = Array.isArray(req.query.formacion) ? req.query.formacion[0] : req.query.formacion;

    const db = getFirestore();

    // Obtener todos los CVs
    const snapshot = await db.collection('cvs').orderBy('uploadedAt', 'desc').get();
    
    let cvs: CV[] = snapshot.docs.map(doc => {
      const data = doc.data() as Omit<CV, 'id'>;
      return {
        id: doc.id,
        ...data,
      };
    });

    // Filtrar por área
    if (area && area !== 'Todos') {
      cvs = cvs.filter(cv => cv.area === area);
    }

    // Filtrar por formación
    if (formacion && formacion !== 'Todos') {
      cvs = cvs.filter(cv => cv.nivelFormacion === formacion);
    }

    return res.status(200).json({ cvs });

  } catch (error: any) {
    console.error('Error al listar CVs:', error);
    return res.status(500).json({ 
      error: 'Error al obtener los CVs',
      details: error.message 
    });
  }
}
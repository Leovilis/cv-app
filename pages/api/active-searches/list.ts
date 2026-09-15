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

    console.log('📋 Listando CVs...');
    console.log('🔍 Filtros - Área:', area || 'Todos', '| Formación:', formacion || 'Todos');

    const db = getFirestore();

    // Obtener todos los CVs
    console.log('📥 Obteniendo CVs de Firestore...');
    const snapshot = await db.collection('cvs').orderBy('uploadedAt', 'desc').get();
    
    console.log(`📊 Total de CVs en base de datos: ${snapshot.docs.length}`);

    let cvs: CV[] = snapshot.docs.map(doc => {
      const data = doc.data() as Omit<CV, 'id'>;
      return {
        id: doc.id,
        ...data,
      };
    });

    // Filtrar por área
    if (area && area !== 'Todos') {
      const beforeFilter = cvs.length;
      cvs = cvs.filter(cv => cv.area?.toLowerCase() === area.toLowerCase());
      console.log(`🔍 Filtro por área '${area}': ${beforeFilter} → ${cvs.length} CVs`);
    }

    // Filtrar por formación
    if (formacion && formacion !== 'Todos') {
      const beforeFilter = cvs.length;
      cvs = cvs.filter(cv => cv.nivelFormacion === formacion);
      console.log(`🔍 Filtro por formación '${formacion}': ${beforeFilter} → ${cvs.length} CVs`);
    }

    console.log(`✅ Retornando ${cvs.length} CVs`);

    return res.status(200).json({ cvs });

  } catch (error: any) {
    console.error('❌ Error al listar CVs:', error);
    console.error('❌ Stack trace:', error.stack);
    return res.status(500).json({ 
      error: 'Error al obtener los CVs',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
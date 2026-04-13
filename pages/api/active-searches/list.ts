// pages/api/active-searches/list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // Solo admin puede ver todas las búsquedas
  const isAdmin = session.user.email === 'sistemas@ddonpedrosrl.com';
  
  try {
    const db = getFirestore();
    let query = db.collection('busquedas_activas').orderBy('creadaAt', 'desc');
    
    // Si no es admin, solo mostrar búsquedas activas
    if (!isAdmin) {
      query = query.where('activa', '==', true);
    }
    
    const snapshot = await query.get();
    const busquedas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return res.status(200).json({ busquedas });
  } catch (error) {
    console.error('Error al listar búsquedas:', error);
    return res.status(500).json({ error: 'Error al obtener las búsquedas' });
  }
}
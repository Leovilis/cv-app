// pages/api/active-searches/list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from '@/lib/firebase-admin';
import { BusquedaActiva } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getFirestore();

    // Sin orderBy para evitar índice compuesto — ordenamos en memoria
    const snapshot = await db
      .collection('busquedas_activas')
      .where('activa', '==', true)
      .get();

    const busquedas: BusquedaActiva[] = snapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as Omit<BusquedaActiva, 'id'>) }))
      .sort((a, b) => new Date(b.creadaAt).getTime() - new Date(a.creadaAt).getTime());

    return res.status(200).json({ busquedas });
  } catch (error: any) {
    console.error('❌ Error al listar búsquedas:', error);
    return res.status(500).json({ error: 'Error al obtener las búsquedas activas', details: error.message });
  }
}
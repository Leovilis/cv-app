// pages/api/areas/list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from '@/lib/firebase-admin';
import { Area } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getFirestore();
    const snapshot = await db.collection('areas').orderBy('nombre', 'asc').get();
    const areas: Area[] = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Area, 'id'>) }));
    return res.status(200).json({ areas });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener las áreas', details: error.message });
  }
}
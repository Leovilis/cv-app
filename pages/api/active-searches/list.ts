// pages/api/active-searches/list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from '@/lib/firebase-admin';
import { BusquedaActiva } from '@/lib/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { isAdminEmail } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getFirestore();

    // ?todas=1 → el admin ve también las búsquedas dadas de baja (inactivas).
    // El formulario público solo recibe las activas.
    let incluirInactivas = false;
    if (req.query.todas === '1') {
      const session = await getServerSession(req, res, authOptions);
      incluirInactivas = isAdminEmail(session?.user?.email);
    }

    // Sin orderBy para evitar índice compuesto — ordenamos en memoria
    const coleccion = db.collection('busquedas_activas');
    const snapshot = incluirInactivas
      ? await coleccion.get()
      : await coleccion.where('activa', '==', true).get();

    const busquedas: BusquedaActiva[] = snapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as Omit<BusquedaActiva, 'id'>) }))
      .sort((a, b) => new Date(b.creadaAt).getTime() - new Date(a.creadaAt).getTime());

    return res.status(200).json({ busquedas });
  } catch (error: any) {
    console.error('❌ Error al listar búsquedas:', error);
    return res.status(500).json({ error: 'Error al obtener las búsquedas activas', details: error.message });
  }
}
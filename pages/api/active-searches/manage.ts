// pages/api/active-searches/manage.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  if (session.user.email !== 'sistemas@ddonpedrosrl.com') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const db = getFirestore();

  // ── POST: crear búsqueda ────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const { titulo, area, lugarResidencia } = req.body;

      if (!titulo?.trim() || !area?.trim() || !lugarResidencia?.trim()) {
        return res.status(400).json({ error: 'Título, área y lugar de residencia son requeridos' });
      }

      const docRef = await db.collection('busquedas_activas').add({
        titulo:          titulo.trim(),
        area:            area.trim(),
        lugarResidencia: lugarResidencia.trim(),
        creadaPor:       session.user.email,
        creadaAt:        new Date().toISOString(),
        activa:          true,
      });

      console.log('✅ Búsqueda activa creada:', docRef.id, titulo);
      return res.status(200).json({ success: true, id: docRef.id, message: 'Búsqueda creada exitosamente' });
    } catch (error: any) {
      console.error('❌ Error al crear búsqueda:', error);
      return res.status(500).json({ error: 'Error al crear la búsqueda', details: error.message });
    }
  }

  // ── DELETE: dar de baja búsqueda ────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
      if (!id) return res.status(400).json({ error: 'Falta el ID de la búsqueda' });

      const doc = await db.collection('busquedas_activas').doc(id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Búsqueda no encontrada' });

      // Dar de baja (soft delete): marcar como inactiva en lugar de borrar
      await db.collection('busquedas_activas').doc(id).update({ activa: false });

      console.log('✅ Búsqueda dada de baja:', id);
      return res.status(200).json({ success: true, message: 'Búsqueda dada de baja exitosamente' });
    } catch (error: any) {
      console.error('❌ Error al dar de baja búsqueda:', error);
      return res.status(500).json({ error: 'Error al dar de baja la búsqueda', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
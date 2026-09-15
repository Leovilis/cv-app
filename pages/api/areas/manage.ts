// pages/api/areas/manage.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'No autorizado' });
  if (session.user.email !== process.env.ADMIN_EMAIL)
    return res.status(403).json({ error: 'Acceso denegado' });

  const db = getFirestore();

  // ── POST: crear área ────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { nombre, puestos } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre del área es requerido' });

    // Verificar nombre duplicado
    const existing = await db.collection('areas').where('nombre', '==', nombre.trim()).get();
    if (!existing.empty) return res.status(400).json({ error: 'Ya existe un área con ese nombre' });

    const docRef = await db.collection('areas').add({
      nombre:    nombre.trim(),
      puestos:   Array.isArray(puestos) ? puestos.map((p: string) => p.trim()).filter(Boolean) : [],
      creadaAt:  new Date().toISOString(),
      creadaPor: session.user.email,
    });
    return res.status(200).json({ success: true, id: docRef.id });
  }

  // ── PUT: editar área ────────────────────────────────────────────────────────
  if (req.method === 'PUT') {
    const { id, nombre, puestos } = req.body;
    if (!id) return res.status(400).json({ error: 'Falta el ID del área' });
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });

    const doc = await db.collection('areas').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Área no encontrada' });

    await db.collection('areas').doc(id).update({
      nombre:  nombre.trim(),
      puestos: Array.isArray(puestos) ? puestos.map((p: string) => p.trim()).filter(Boolean) : [],
    });
    return res.status(200).json({ success: true });
  }

  // ── DELETE: eliminar área ───────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!id) return res.status(400).json({ error: 'Falta el ID' });

    const doc = await db.collection('areas').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Área no encontrada' });

    await db.collection('areas').doc(id).delete();
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
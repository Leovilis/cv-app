// pages/api/active-searches/manage.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getFirestore } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  console.log('🔍 [manage.ts] Method:', req.method);
  console.log('🔍 [manage.ts] Session user:', session?.user?.email);
  
  // Verificar autenticación y rol de admin
  if (!session || session.user?.email !== 'sistemas@ddonpedrosrl.com') {
    console.log('❌ [manage.ts] No autorizado');
    return res.status(401).json({ error: 'No autorizado' });
  }

  const db = getFirestore();
  const { method } = req;

  // GET - Obtener una búsqueda específica
  if (method === 'GET') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Se requiere ID' });
    }
    
    try {
      const doc = await db.collection('busquedas_activas').doc(id as string).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Búsqueda no encontrada' });
      }
      return res.status(200).json({ busqueda: { id: doc.id, ...doc.data() } });
    } catch (error) {
      console.error('❌ Error GET:', error);
      return res.status(500).json({ error: 'Error al obtener la búsqueda' });
    }
  }

  // POST - Crear nueva búsqueda
  if (method === 'POST') {
    const { 
      titulo, 
      area, 
      puesto, 
      lugarResidencia, 
      acercaDelPuesto, 
      principalesResponsabilidades, 
      requisitos 
    } = req.body;
    
    if (!titulo || !area || !puesto || !lugarResidencia) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    try {
      const nuevaBusqueda = {
        titulo,
        area,
        puesto,
        lugarResidencia,
        acercaDelPuesto: acercaDelPuesto || '',
        principalesResponsabilidades: principalesResponsabilidades || '',
        requisitos: requisitos || '',
        activa: true,
        creadaAt: new Date().toISOString(),
        creadaPor: session.user.email,
      };
      
      const docRef = await db.collection('busquedas_activas').add(nuevaBusqueda);
      console.log('✅ Búsqueda creada:', docRef.id);
      return res.status(200).json({ 
        success: true, 
        id: docRef.id,
        message: 'Búsqueda creada exitosamente'
      });
    } catch (error) {
      console.error('❌ Error POST:', error);
      return res.status(500).json({ error: 'Error al crear la búsqueda' });
    }
  }

  // PUT - Actualizar búsqueda
  if (method === 'PUT') {
    const { 
      id, 
      titulo, 
      area, 
      puesto, 
      lugarResidencia, 
      activa,
      acercaDelPuesto,
      principalesResponsabilidades,
      requisitos
    } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Se requiere ID' });
    }
    
    try {
      const updateData: any = {};
      if (titulo !== undefined) updateData.titulo = titulo;
      if (area !== undefined) updateData.area = area;
      if (puesto !== undefined) updateData.puesto = puesto;
      if (lugarResidencia !== undefined) updateData.lugarResidencia = lugarResidencia;
      if (activa !== undefined) updateData.activa = activa;
      if (acercaDelPuesto !== undefined) updateData.acercaDelPuesto = acercaDelPuesto;
      if (principalesResponsabilidades !== undefined) updateData.principalesResponsabilidades = principalesResponsabilidades;
      if (requisitos !== undefined) updateData.requisitos = requisitos;
      
      updateData.actualizadaAt = new Date().toISOString();
      updateData.actualizadaPor = session.user.email;
      
      await db.collection('busquedas_activas').doc(id).update(updateData);
      console.log('✅ Búsqueda actualizada:', id);
      return res.status(200).json({ success: true, message: 'Búsqueda actualizada' });
    } catch (error) {
      console.error('❌ Error PUT:', error);
      return res.status(500).json({ error: 'Error al actualizar la búsqueda' });
    }
  }

  // DELETE - Eliminar completamente la búsqueda
  if (method === 'DELETE') {
    let id = req.query.id as string;
    
    if (!id && req.body) {
      id = req.body.id;
    }
    
    if (Array.isArray(id)) {
      id = id[0];
    }
    
    if (!id) {
      return res.status(400).json({ error: 'Se requiere ID' });
    }
    
    try {
      const docRef = db.collection('busquedas_activas').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: 'Búsqueda no encontrada' });
      }
      
      await docRef.delete();
      console.log('✅ Búsqueda eliminada:', id);
      return res.status(200).json({ success: true, message: 'Búsqueda eliminada' });
    } catch (error) {
      console.error('❌ Error DELETE:', error);
      return res.status(500).json({ error: 'Error al eliminar la búsqueda' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getStorage, getFirestore, bucketName } from '@/lib/firebase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar autenticación y permisos de admin
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (session.user.email !== 'sistemas@ddonpedrosrl.com') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      console.error('❌ ID inválido:', id);
      return res.status(400).json({ error: 'ID inválido' });
    }

    console.log('🗑️ Intentando eliminar CV con ID:', id);

    const storage = getStorage();
    const db = getFirestore();

    // Obtener datos del CV
    const cvDoc = await db.collection('cvs').doc(id).get();

    if (!cvDoc.exists) {
      console.error('❌ CV no encontrado:', id);
      return res.status(404).json({ error: 'CV no encontrado' });
    }

    const cvData = cvDoc.data();

    if (!cvData) {
      console.error('❌ Datos del CV vacíos:', id);
      return res.status(404).json({ error: 'Datos del CV no encontrados' });
    }

    console.log('📄 CV encontrado:', cvData.cvFileName);

    // Eliminar archivo de Cloud Storage (si existe)
    if (cvData.cvStoragePath) {
      try {
        console.log('🗑️ Eliminando archivo de Storage:', cvData.cvStoragePath);
        await storage.bucket(bucketName).file(cvData.cvStoragePath).delete();
        console.log('✅ Archivo eliminado de Storage');
      } catch (storageError: any) {
        // Si el archivo no existe en Storage, continuar de todos modos
        console.warn('⚠️ No se pudo eliminar archivo de Storage (puede que no exista):', storageError.message);
      }
    } else {
      console.warn('⚠️ CV no tiene cvStoragePath, solo se eliminará de Firestore');
    }

    // Eliminar documento de Firestore
    console.log('🗑️ Eliminando documento de Firestore:', id);
    await db.collection('cvs').doc(id).delete();
    console.log('✅ Documento eliminado de Firestore');

    return res.status(200).json({ 
      success: true,
      message: 'CV eliminado exitosamente',
    });

  } catch (error: any) {
    console.error('❌ Error al eliminar CV:', error);
    console.error('❌ Stack trace:', error.stack);
    return res.status(500).json({ 
      error: 'Error al eliminar el CV',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
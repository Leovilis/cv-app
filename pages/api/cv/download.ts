import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getStorage, getFirestore, bucketName } from '@/lib/firebase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    console.log('📥 Generando URL de descarga para CV:', id);

    const storage = getStorage();
    const db = getFirestore();

    // Obtener datos del CV desde Firestore
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

    if (!cvData.cvStoragePath) {
      console.error('❌ CV no tiene cvStoragePath:', id);
      return res.status(404).json({ error: 'Archivo del CV no encontrado' });
    }

    console.log('📄 CV encontrado:', cvData.cvFileName);
    console.log('📦 Storage path:', cvData.cvStoragePath);

    // Generar URL firmada para descarga
    const file = storage.bucket(bucketName).file(cvData.cvStoragePath);
    
    // Verificar que el archivo existe
    const [exists] = await file.exists();
    if (!exists) {
      console.error('❌ Archivo no existe en Storage:', cvData.cvStoragePath);
      return res.status(404).json({ 
        error: 'El archivo del CV no existe en el servidor',
        details: 'El archivo puede haber sido eliminado manualmente'
      });
    }

    console.log('✅ Archivo existe en Storage, generando URL firmada...');

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 15, // 15 minutos
    });

    console.log('✅ URL de descarga generada exitosamente');

    return res.status(200).json({ 
      downloadUrl: url,
      fileName: cvData.cvFileName,
    });

  } catch (error: any) {
    console.error('❌ Error al generar URL de descarga:', error);
    console.error('❌ Stack trace:', error.stack);
    return res.status(500).json({ 
      error: 'Error al generar la descarga',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
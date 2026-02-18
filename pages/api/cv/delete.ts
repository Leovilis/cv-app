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
      return res.status(400).json({ error: 'ID inválido' });
    }

    const storage = getStorage();
    const db = getFirestore();

    // Obtener datos del CV
    const cvDoc = await db.collection('cvs').doc(id).get();

    if (!cvDoc.exists) {
      return res.status(404).json({ error: 'CV no encontrado' });
    }

    const cvData = cvDoc.data()!;

    // Eliminar archivo de Cloud Storage
    await storage.bucket(bucketName).file(cvData.cvStoragePath).delete();

    // Eliminar documento de Firestore
    await db.collection('cvs').doc(id).delete();

    return res.status(200).json({ 
      success: true,
      message: 'CV eliminado exitosamente',
    });

  } catch (error) {
    console.error('Error al eliminar CV:', error);
    return res.status(500).json({ error: 'Error al eliminar el CV' });
  }
}
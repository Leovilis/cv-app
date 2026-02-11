import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getStorage, getFirestore, bucketName } from '@/lib/firebase';

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
      return res.status(400).json({ error: 'ID inválido' });
    }

    const storage = getStorage();
    const db = getFirestore();

    // Obtener datos del CV desde Firestore
    const cvDoc = await db.collection('cvs').doc(id).get();

    if (!cvDoc.exists) {
      return res.status(404).json({ error: 'CV no encontrado' });
    }

    const cvData = cvDoc.data()!;

    // Generar URL firmada para descarga
    const file = storage.bucket(bucketName).file(cvData.cvStoragePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 15, // 15 minutos
    });

    return res.status(200).json({ 
      downloadUrl: url,
      fileName: cvData.cvFileName,
    });

  } catch (error) {
    console.error('Error al generar URL de descarga:', error);
    return res.status(500).json({ error: 'Error al generar la descarga' });
  }
}
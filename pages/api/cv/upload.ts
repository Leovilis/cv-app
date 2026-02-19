import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getStorage, getFirestore, bucketName } from '@/lib/firebase-admin';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  console.log('📤 Iniciando upload de CV por:', session.user.email);

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024,
      filter: function ({ mimetype }) {
        return mimetype === 'application/pdf';
      },
    });

    console.log('📋 Parseando formulario...');
    const [fields, files] = await form.parse(req);

    const nombre = Array.isArray(fields.nombre) ? fields.nombre[0] : fields.nombre;
    const apellido = Array.isArray(fields.apellido) ? fields.apellido[0] : fields.apellido;
    const dni = Array.isArray(fields.dni) ? fields.dni[0] : fields.dni;
    const telefonoArea = Array.isArray(fields.telefonoArea) ? fields.telefonoArea[0] : fields.telefonoArea;
    const telefonoNumero = Array.isArray(fields.telefonoNumero) ? fields.telefonoNumero[0] : fields.telefonoNumero;
    const fechaNacimiento = Array.isArray(fields.fechaNacimiento) 
      ? fields.fechaNacimiento[0] 
      : fields.fechaNacimiento;
    const nivelFormacion = Array.isArray(fields.nivelFormacion) ? fields.nivelFormacion[0] : fields.nivelFormacion;
    const area = Array.isArray(fields.area) ? fields.area[0] : fields.area || 'Genérico';
    const cvFile = Array.isArray(files.cv) ? files.cv[0] : files.cv;

    console.log('👤 Datos recibidos:', { nombre, apellido, dni, area, nivelFormacion });

    // Validaciones
    if (!nombre || !apellido || !dni || !telefonoArea || !telefonoNumero || !fechaNacimiento || !nivelFormacion || !cvFile) {
      console.error('❌ Faltan campos requeridos');
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    if (!/^\d{7,8}$/.test(dni)) {
      console.error('❌ DNI inválido:', dni);
      return res.status(400).json({ error: 'DNI inválido' });
    }

    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(fechaNacimiento)) {
      console.error('❌ Formato de fecha inválido:', fechaNacimiento);
      return res.status(400).json({ error: 'Formato de fecha inválido' });
    }

    console.log('✅ Validaciones pasadas');

    const storage = getStorage();
    const db = getFirestore();

    // Verificar si existe CV previo con mismo DNI
    console.log('🔍 Buscando CVs existentes con DNI:', dni);
    const existingCVQuery = await db.collection('cvs').where('dni', '==', dni).get();
    
    let replacedCV = false;
    
    if (!existingCVQuery.empty) {
      console.log('⚠️ Encontrado CV previo, reemplazando...');
      const oldCV = existingCVQuery.docs[0];
      const oldCVData = oldCV.data();
      
      // Intentar eliminar archivo anterior
      if (oldCVData.cvStoragePath) {
        try {
          await storage.bucket(bucketName).file(oldCVData.cvStoragePath).delete();
          console.log('✅ Archivo anterior eliminado');
        } catch (error) {
          console.warn('⚠️ No se pudo eliminar el archivo anterior:', error);
        }
      }
      
      await db.collection('cvs').doc(oldCV.id).delete();
      console.log('✅ Documento anterior eliminado');
      replacedCV = true;
    }

    // Subir archivo a Storage
    const timestamp = Date.now();
    const safeFileName = cvFile.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'cv.pdf';
    const fileName = `cvs/${timestamp}_${dni}_${safeFileName}`;
    
    console.log('📤 Subiendo archivo a Storage:', fileName);

    await storage.bucket(bucketName).upload(cvFile.filepath, {
      destination: fileName,
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          uploadedBy: session.user.email!,
          nombre,
          apellido,
          dni,
        },
      },
    });

    console.log('✅ Archivo subido a Storage');

    // Generar URL firmada
    console.log('🔗 Generando URL firmada...');
    const file = storage.bucket(bucketName).file(fileName);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 10, // 10 años
    });

    console.log('✅ URL firmada generada');

    // Guardar en Firestore
    const cvData = {
      nombre,
      apellido,
      dni,
      telefonoArea,
      telefonoNumero,
      fechaNacimiento,
      nivelFormacion,
      area,
      cvFileName: cvFile.originalFilename || 'cv.pdf',
      cvStoragePath: fileName,
      cvUrl: url,
      uploadedBy: session.user.email,
      uploadedAt: new Date().toISOString(),
    };

    console.log('💾 Guardando en Firestore...');
    const docRef = await db.collection('cvs').add(cvData);
    console.log('✅ Guardado en Firestore con ID:', docRef.id);

    // Limpiar archivo temporal
    try {
      fs.unlinkSync(cvFile.filepath);
      console.log('✅ Archivo temporal eliminado');
    } catch (e) {
      console.warn('⚠️ No se pudo eliminar archivo temporal:', e);
    }

    console.log('🎉 Upload completado exitosamente');

    return res.status(200).json({
      success: true,
      id: docRef.id,
      replaced: replacedCV,
      message: replacedCV 
        ? 'CV actualizado exitosamente. Se reemplazó el CV anterior.' 
        : 'CV subido exitosamente',
    });

  } catch (error: any) {
    console.error('❌ Error al subir CV:', error);
    console.error('❌ Stack trace:', error.stack);
    return res.status(500).json({ 
      error: 'Error al procesar el CV',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
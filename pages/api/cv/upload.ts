// pages/api/cv/upload.ts - Versión con más logs y manejo de errores

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
  console.log('🚀 [UPLOAD] Iniciando handler...');
  console.log('📌 Método:', req.method);
  
  if (req.method !== 'POST') {
    console.log('❌ Método no permitido:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('🔐 Session:', session ? 'Autenticado' : 'No autenticado');
    console.log('📧 Usuario:', session?.user?.email);
    
    if (!session || !session.user) {
      console.log('❌ No autorizado');
      return res.status(401).json({ error: 'No autorizado' });
    }

    console.log('📤 Iniciando upload de CV por:', session.user.email);

    const form = formidable({
      maxFileSize: 500 * 1024,
      filter: function ({ mimetype }) {
        return mimetype === 'application/pdf';
      },
    });

    console.log('📋 Parseando formulario...');
    const [fields, files] = await form.parse(req);
    
    console.log('📦 Fields recibidos:', Object.keys(fields));
    console.log('📦 Files recibidos:', files.cv ? 'CV presente' : 'No hay CV');

    // Obtener campos del formulario
    const nombre = Array.isArray(fields.nombre) ? fields.nombre[0] : fields.nombre;
    const apellido = Array.isArray(fields.apellido) ? fields.apellido[0] : fields.apellido;
    const dni = Array.isArray(fields.dni) ? fields.dni[0] : fields.dni;
    const telefonoArea = Array.isArray(fields.telefonoArea) ? fields.telefonoArea[0] : fields.telefonoArea;
    const telefonoNumero = Array.isArray(fields.telefonoNumero) ? fields.telefonoNumero[0] : fields.telefonoNumero;
    const fechaNacimiento = Array.isArray(fields.fechaNacimiento) ? fields.fechaNacimiento[0] : fields.fechaNacimiento;
    const nivelFormacion = Array.isArray(fields.nivelFormacion) ? fields.nivelFormacion[0] : fields.nivelFormacion;
    const area = Array.isArray(fields.area) ? fields.area[0] : fields.area;
    const subArea = Array.isArray(fields.subArea) ? fields.subArea[0] : (fields.subArea || '');
    const puestosPostuladosRaw = Array.isArray(fields.puestosPostulados) ? fields.puestosPostulados[0] : fields.puestosPostulados;
    const lugarResidencia = Array.isArray(fields.lugarResidencia) ? fields.lugarResidencia[0] : (fields.lugarResidencia || '');
    const email = Array.isArray(fields.email) ? fields.email[0] : (fields.email || '');
    const busquedasPostuladasRaw = Array.isArray(fields.busquedasPostuladas) ? fields.busquedasPostuladas[0] : (fields.busquedasPostuladas || '[]');
    const cvFile = Array.isArray(files.cv) ? files.cv[0] : files.cv;

    // Parsear JSONs
    let puestosPostulados: Array<{ area: string; subArea: string }> = [];
    try {
      puestosPostulados = JSON.parse(puestosPostuladosRaw || '[]');
    } catch (e) {
      console.warn('⚠️ Error parsing puestosPostulados:', e);
      puestosPostulados = [];
    }

    let busquedasPostuladas: string[] = [];
    try {
      busquedasPostuladas = JSON.parse(busquedasPostuladasRaw);
    } catch (e) {
      console.warn('⚠️ Error parsing busquedasPostuladas:', e);
      busquedasPostuladas = [];
    }

    console.log('👤 Datos recibidos:', { 
      nombre, 
      apellido, 
      dni, 
      area, 
      subArea: subArea || '(vacío)',
      nivelFormacion, 
      lugarResidencia,
      puestosPostulados: puestosPostulados.length,
      busquedasPostuladas: busquedasPostuladas.length
    });

    // Validaciones básicas
    if (!nombre || !apellido || !dni || !telefonoArea || !telefonoNumero || 
        !fechaNacimiento || !nivelFormacion || !area || !cvFile) {
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
      return res.status(400).json({ error: 'Formato de fecha inválido. Use DD/MM/YYYY' });
    }

    console.log('✅ Validaciones pasadas');

    const storage = getStorage();
    const db = getFirestore();

    // Verificar si existe CV previo
    console.log('🔍 Buscando CVs existentes con DNI:', dni);
    const existingCVQuery = await db.collection('cvs').where('dni', '==', dni).get();
    
    let replacedCV = false;
    
    if (!existingCVQuery.empty) {
      console.log('⚠️ Encontrado CV previo, reemplazando...');
      const oldCV = existingCVQuery.docs[0];
      const oldCVData = oldCV.data();
      
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
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 10,
    });

    console.log('✅ URL firmada generada');

    // Obtener información de búsquedas activas
    let busquedasInfo: Array<{ id: string; titulo: string; puesto: string }> = [];
    if (busquedasPostuladas.length > 0) {
      try {
        for (const bId of busquedasPostuladas) {
          const busquedaDoc = await db.collection('busquedas_activas').doc(bId).get();
          if (busquedaDoc.exists) {
            const busquedaData = busquedaDoc.data();
            busquedasInfo.push({
              id: bId,
              titulo: busquedaData?.titulo || '',
              puesto: busquedaData?.puesto || '',
            });
          }
        }
        console.log('✅ Búsquedas activas encontradas:', busquedasInfo.length);
      } catch (err) {
        console.warn('⚠️ Error al obtener búsquedas activas:', err);
      }
    }

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
      subArea: subArea || '',
      puestosPostulados,
      lugarResidencia: lugarResidencia || '',
      email: email || '',
      busquedasPostuladas,
      busquedasInfo,
      cvFileName: cvFile.originalFilename || 'cv.pdf',
      cvStoragePath: fileName,
      cvUrl: url,
      uploadedBy: session.user.email,
      uploadedAt: new Date().toISOString(),
      estadoSeleccion: 'En Curso',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    console.error('❌ Error en el handler:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Devolver error como JSON, no como HTML
    return res.status(500).json({ 
      error: 'Error al procesar el CV',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
// pages/api/cv/upload.ts - Versión corregida sin errores TypeScript

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
    console.log('📤 Iniciando upload de CV');

    const form = formidable({
      maxFileSize: 500 * 1024, // 500KB
      filter: function ({ mimetype }) {
        if (mimetype !== 'application/pdf') {
          console.log('❌ Tipo de archivo no permitido:', mimetype);
          return false;
        }
        return true;
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
    const area = Array.isArray(fields.area) ? fields.area[0] : (fields.area || '');
    const subArea = Array.isArray(fields.subArea) ? fields.subArea[0] : (fields.subArea || '');
    const lugarResidencia = Array.isArray(fields.lugarResidencia) ? fields.lugarResidencia[0] : (fields.lugarResidencia || '');
    const email = Array.isArray(fields.email) ? fields.email[0] : (fields.email || '');
    const privacidadAceptada = Array.isArray(fields.privacidadAceptada) ? fields.privacidadAceptada[0] === 'true' : false;
    const fechaAceptacion = Array.isArray(fields.fechaAceptacion) ? fields.fechaAceptacion[0] : new Date().toISOString();
    const busquedasPostuladasRaw = Array.isArray(fields.busquedasPostuladas) ? fields.busquedasPostuladas[0] : (fields.busquedasPostuladas || '[]');
    
    // Obtener el archivo CV - verificar que existe
    const cvFile = files.cv && Array.isArray(files.cv) ? files.cv[0] : (files.cv as formidable.File | undefined);

    // Parsear búsquedas postuladas
    let busquedasPostuladas: string[] = [];
    try {
      busquedasPostuladas = JSON.parse(busquedasPostuladasRaw);
    } catch (e) {
      console.warn('⚠️ Error parsing busquedasPostuladas:', e);
      busquedasPostuladas = [];
    }

    const tieneBusquedas = busquedasPostuladas.length > 0;

    console.log('👤 Datos recibidos:', { 
      nombre, 
      apellido, 
      dni, 
      area: area || '(vacío)', 
      subArea: subArea || '(vacío)',
      nivelFormacion, 
      lugarResidencia,
      tieneBusquedas,
      busquedasPostuladas: busquedasPostuladas.length
    });

    // VALIDACIONES
    const errors: string[] = [];

    // Campos siempre requeridos
    if (!nombre) errors.push('Nombre es requerido');
    if (!apellido) errors.push('Apellido es requerido');
    if (!dni) errors.push('DNI es requerido');
    if (dni && !/^\d{7,8}$/.test(dni)) errors.push('DNI inválido (debe tener 7 u 8 dígitos)');
    if (!telefonoArea) errors.push('Código de área es requerido');
    if (!telefonoNumero) errors.push('Número de teléfono es requerido');
    if (!fechaNacimiento) errors.push('Fecha de nacimiento es requerida');
    if (!nivelFormacion) errors.push('Nivel de formación es requerido');
    if (!lugarResidencia) errors.push('Lugar de residencia es requerido');
    if (!privacidadAceptada) errors.push('Debe aceptar la política de privacidad');
    
    // Validar CV
    if (!cvFile) {
      errors.push('CV es requerido');
    } else if (cvFile.size > 500 * 1024) {
      errors.push('El archivo PDF no debe superar los 500KB');
    } else if (cvFile.mimetype !== 'application/pdf') {
      errors.push('Solo se permiten archivos PDF');
    }

    // Validar formato de fecha
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (fechaNacimiento && !dateRegex.test(fechaNacimiento)) {
      errors.push('Formato de fecha inválido. Use DD/MM/YYYY');
    }

    // Validación condicional: Solo requiere área y subArea si NO postula a búsqueda activa
    if (!tieneBusquedas) {
      if (!area) errors.push('Área es requerida (no seleccionó búsqueda activa)');
      if (!subArea) errors.push('Puesto es requerido (no seleccionó búsqueda activa)');
    }

    if (errors.length > 0) {
      console.error('❌ Errores de validación:', errors);
      return res.status(400).json({ error: errors.join(', ') });
    }

    console.log('✅ Validaciones pasadas');

    const storage = getStorage();
    const db = getFirestore();

    // Verificar si existe CV previo con el mismo DNI
    console.log('🔍 Buscando CVs existentes con DNI:', dni);
    const existingCVQuery = await db.collection('cvs').where('dni', '==', dni).get();
    
    let replacedCV = false;
    let oldCVId = null;
    
    if (!existingCVQuery.empty) {
      console.log('⚠️ Encontrado CV previo, reemplazando...');
      const oldCV = existingCVQuery.docs[0];
      oldCVId = oldCV.id;
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

    // Subir archivo a Storage (cvFile existe aquí porque ya pasó la validación)
    const timestamp = Date.now();
    const safeFileName = cvFile!.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'cv.pdf';
    const fileName = `cvs/${timestamp}_${dni}_${safeFileName}`;
    
    console.log('📤 Subiendo archivo a Storage:', fileName);

    await storage.bucket(bucketName).upload(cvFile!.filepath, {
      destination: fileName,
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          uploadedBy: 'candidato',
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

    // Obtener información de búsquedas activas
    let busquedasInfo: Array<{ id: string; titulo: string; area: string; puesto: string; lugarResidencia: string }> = [];
    if (busquedasPostuladas.length > 0) {
      try {
        for (const bId of busquedasPostuladas) {
          const busquedaDoc = await db.collection('busquedas_activas').doc(bId).get();
          if (busquedaDoc.exists) {
            const busquedaData = busquedaDoc.data();
            busquedasInfo.push({
              id: bId,
              titulo: busquedaData?.titulo || '',
              area: busquedaData?.area || '',
              puesto: busquedaData?.puesto || '',
              lugarResidencia: busquedaData?.lugarResidencia || '',
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
      area: tieneBusquedas ? '' : area,
      subArea: tieneBusquedas ? '' : subArea,
      lugarResidencia,
      email: email || '',
      busquedasPostuladas,
      busquedasInfo,
      cvFileName: cvFile!.originalFilename || 'cv.pdf',
      cvStoragePath: fileName,
      cvUrl: url,
      uploadedBy: 'candidato',
      uploadedAt: new Date().toISOString(),
      privacidadAceptada,
      fechaAceptacion,
      estadoSeleccion: 'En Curso',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('💾 Guardando en Firestore...');
    const docRef = await db.collection('cvs').add(cvData);
    console.log('✅ Guardado en Firestore con ID:', docRef.id);

    // Limpiar archivo temporal
    try {
      fs.unlinkSync(cvFile!.filepath);
      console.log('✅ Archivo temporal eliminado');
    } catch (e) {
      console.warn('⚠️ No se pudo eliminar archivo temporal:', e);
    }

    console.log('🎉 Upload completado exitosamente');

    return res.status(200).json({
      success: true,
      id: docRef.id,
      replaced: replacedCV,
      oldId: oldCVId,
      message: replacedCV 
        ? 'CV actualizado exitosamente. Se reemplazó el CV anterior.' 
        : 'CV subido exitosamente',
    });

  } catch (error: any) {
    console.error('❌ Error en el handler:', error);
    console.error('❌ Stack trace:', error.stack);
    
    return res.status(500).json({ 
      error: 'Error al procesar el CV',
      details: error.message,
    });
  }
}
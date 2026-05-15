// pages/api/cv/upload.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getStorage, getFirestore, bucketName } from '@/lib/firebase-admin';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 500 * 1024; // 500KB

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

    // ✅ FIX: No usar `filter` para rechazar silenciosamente — simplemente
    // parseamos sin filtro y validamos el mimetype manualmente después.
    // El filtro de formidable devuelve false sin propagar error, lo que deja
    // files.cv undefined y provoca el crash 500 posterior.
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
    });

    console.log('📋 Parseando formulario...');

    let fields: formidable.Fields;
    let files: formidable.Files;

    try {
      [fields, files] = await form.parse(req);
    } catch (parseError: any) {
      // formidable lanza error si el archivo supera maxFileSize
      console.error('❌ Error al parsear formulario:', parseError.message);

      if (
        parseError.code === 1009 || // formidable: maxFileSize exceeded
        /maxFileSize/i.test(parseError.message)
      ) {
        return res.status(400).json({
          error: `El archivo PDF no debe superar los ${MAX_FILE_SIZE / 1024}KB`,
        });
      }

      return res.status(400).json({
        error: 'Error al procesar el formulario: ' + parseError.message,
      });
    }

    console.log('📦 Fields recibidos:', Object.keys(fields));
    console.log('📦 Files recibidos:', files.cv ? 'CV presente' : 'No hay CV');

    // Obtener campos del formulario
    const nombre           = Array.isArray(fields.nombre)           ? fields.nombre[0]           : fields.nombre;
    const apellido         = Array.isArray(fields.apellido)         ? fields.apellido[0]         : fields.apellido;
    const dni              = Array.isArray(fields.dni)              ? fields.dni[0]              : fields.dni;
    const telefonoArea     = Array.isArray(fields.telefonoArea)     ? fields.telefonoArea[0]     : fields.telefonoArea;
    const telefonoNumero   = Array.isArray(fields.telefonoNumero)   ? fields.telefonoNumero[0]   : fields.telefonoNumero;
    const fechaNacimiento  = Array.isArray(fields.fechaNacimiento)  ? fields.fechaNacimiento[0]  : fields.fechaNacimiento;
    const nivelFormacion   = Array.isArray(fields.nivelFormacion)   ? fields.nivelFormacion[0]   : fields.nivelFormacion;
    const area             = Array.isArray(fields.area)             ? fields.area[0]             : (fields.area             ?? '');
    const subArea          = Array.isArray(fields.subArea)          ? fields.subArea[0]          : (fields.subArea          ?? '');
    const lugarResidencia  = Array.isArray(fields.lugarResidencia)  ? fields.lugarResidencia[0]  : (fields.lugarResidencia  ?? '');
    const email            = Array.isArray(fields.email)            ? fields.email[0]            : (fields.email            ?? '');
    const privacidadAceptada =
      Array.isArray(fields.privacidadAceptada)
        ? fields.privacidadAceptada[0] === 'true'
        : false;
    const fechaAceptacion  = Array.isArray(fields.fechaAceptacion)  ? fields.fechaAceptacion[0]  : (fields.fechaAceptacion  ?? new Date().toISOString());
    const busquedasPostuladasRaw =
      Array.isArray(fields.busquedasPostuladas)
        ? fields.busquedasPostuladas[0]
        : (fields.busquedasPostuladas ?? '[]');

    // Obtener el archivo CV
    const cvFile: formidable.File | undefined =
      files.cv
        ? Array.isArray(files.cv)
          ? files.cv[0]
          : (files.cv as formidable.File)
        : undefined;

    // Parsear búsquedas postuladas
    let busquedasPostuladas: string[] = [];
    try {
      busquedasPostuladas = JSON.parse(busquedasPostuladasRaw as string);
      if (!Array.isArray(busquedasPostuladas)) busquedasPostuladas = [];
    } catch {
      busquedasPostuladas = [];
    }

    const tieneBusquedas = busquedasPostuladas.length > 0;

    console.log('👤 Datos recibidos:', {
      nombre, apellido, dni,
      area: area || '(vacío)',
      subArea: subArea || '(vacío)',
      nivelFormacion, lugarResidencia,
      tieneBusquedas,
      busquedasCount: busquedasPostuladas.length,
    });

    // ─── VALIDACIONES ───────────────────────────────────────────────────────
    const errors: string[] = [];

    if (!nombre)        errors.push('Nombre es requerido');
    if (!apellido)      errors.push('Apellido es requerido');
    if (!dni)           errors.push('DNI es requerido');
    if (dni && !/^\d{7,8}$/.test(dni)) errors.push('DNI inválido (debe tener 7 u 8 dígitos)');
    if (!telefonoArea)  errors.push('Código de área es requerido');
    if (!telefonoNumero) errors.push('Número de teléfono es requerido');
    if (!fechaNacimiento) errors.push('Fecha de nacimiento es requerida');
    if (!nivelFormacion)  errors.push('Nivel de formación es requerido');
    if (!lugarResidencia) errors.push('Lugar de residencia es requerido');
    if (!privacidadAceptada) errors.push('Debe aceptar la política de privacidad');

    // Validar CV
    if (!cvFile) {
      errors.push('CV es requerido');
    } else {
      // ✅ FIX: validar mimetype aquí, no en el filter de formidable
      if (cvFile.mimetype !== 'application/pdf') {
        errors.push('Solo se permiten archivos PDF');
      }
      if (cvFile.size > MAX_FILE_SIZE) {
        errors.push(`El archivo PDF no debe superar los ${MAX_FILE_SIZE / 1024}KB`);
      }
    }

    // Validar formato de fecha
    if (fechaNacimiento && !/^(\d{2})\/(\d{2})\/(\d{4})$/.test(fechaNacimiento as string)) {
      errors.push('Formato de fecha inválido. Use DD/MM/YYYY');
    }

    // ✅ Área y puesto solo requeridos si NO postula a búsqueda activa
    if (!tieneBusquedas) {
      if (!area)    errors.push('Área es requerida cuando no se selecciona búsqueda activa');
      if (!subArea) errors.push('Puesto es requerido cuando no se selecciona búsqueda activa');
    }

    if (errors.length > 0) {
      console.error('❌ Errores de validación:', errors);
      return res.status(400).json({ error: errors.join(', ') });
    }

    console.log('✅ Validaciones pasadas');

    // ─── STORAGE & FIRESTORE ─────────────────────────────────────────────────
    const storage = getStorage();
    const db = getFirestore();

    // Verificar si existe CV previo con el mismo DNI
    console.log('🔍 Buscando CVs existentes con DNI:', dni);
    const existingCVQuery = await db.collection('cvs').where('dni', '==', dni).get();

    let replacedCV = false;
    let oldCVId: string | null = null;

    if (!existingCVQuery.empty) {
      console.log('⚠️ Encontrado CV previo, reemplazando...');
      const oldCV = existingCVQuery.docs[0];
      oldCVId = oldCV.id;
      const oldCVData = oldCV.data();

      if (oldCVData.cvStoragePath) {
        try {
          await storage.bucket(bucketName).file(oldCVData.cvStoragePath).delete();
          console.log('✅ Archivo anterior eliminado');
        } catch (err) {
          console.warn('⚠️ No se pudo eliminar el archivo anterior:', err);
        }
      }

      await db.collection('cvs').doc(oldCV.id).delete();
      console.log('✅ Documento anterior eliminado');
      replacedCV = true;
    }

    // Subir archivo a Storage
    const timestamp = Date.now();
    const safeFileName = cvFile!.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'cv.pdf';
    const fileName = `cvs/${timestamp}_${dni}_${safeFileName}`;

    console.log('📤 Subiendo archivo a Storage:', fileName);

    await storage.bucket(bucketName).upload(cvFile!.filepath, {
      destination: fileName,
      metadata: {
        contentType: 'application/pdf',
        metadata: { uploadedBy: 'candidato', nombre, apellido, dni },
      },
    });

    console.log('✅ Archivo subido a Storage');

    // Generar URL firmada (10 años)
    console.log('🔗 Generando URL firmada...');
    const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 10,
    });
    console.log('✅ URL firmada generada');

    // Obtener información de búsquedas activas
    let busquedasInfo: Array<{
      id: string; titulo: string; area: string; puesto: string; lugarResidencia: string;
    }> = [];

    if (busquedasPostuladas.length > 0) {
      try {
        for (const bId of busquedasPostuladas) {
          const busquedaDoc = await db.collection('busquedas_activas').doc(bId).get();
          if (busquedaDoc.exists) {
            const d = busquedaDoc.data()!;
            busquedasInfo.push({
              id: bId,
              titulo: d.titulo || '',
              area: d.area || '',
              puesto: d.puesto || '',
              lugarResidencia: d.lugarResidencia || '',
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
      area:    tieneBusquedas ? '' : area,
      subArea: tieneBusquedas ? '' : subArea,
      lugarResidencia,
      email: email || '',
      busquedasPostuladas,
      busquedasInfo,
      cvFileName:    cvFile!.originalFilename || 'cv.pdf',
      cvStoragePath: fileName,
      cvUrl:         url,
      uploadedBy:    'candidato',
      uploadedAt:    new Date().toISOString(),
      privacidadAceptada,
      fechaAceptacion,
      estadoSeleccion: 'En Curso',
      createdAt:  new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
    };

    console.log('💾 Guardando en Firestore...');
    const docRef = await db.collection('cvs').add(cvData);
    console.log('✅ Guardado en Firestore con ID:', docRef.id);

    // Limpiar archivo temporal
    try {
      fs.unlinkSync(cvFile!.filepath);
      console.log('✅ Archivo temporal eliminado');
    } catch {
      console.warn('⚠️ No se pudo eliminar archivo temporal');
    }

    console.log('🎉 Upload completado exitosamente');

    return res.status(200).json({
      success: true,
      id:       docRef.id,
      replaced: replacedCV,
      oldId:    oldCVId,
      message:  replacedCV
        ? 'CV actualizado exitosamente. Se reemplazó el CV anterior.'
        : 'CV subido exitosamente',
    });

  } catch (error: any) {
    console.error('❌ Error en el handler:', error);
    console.error('❌ Stack trace:', error.stack);
    return res.status(500).json({
      error:   'Error al procesar el CV',
      details: error.message,
    });
  }
}
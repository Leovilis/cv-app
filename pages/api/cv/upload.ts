import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getStorage, getFirestore, bucketName } from '@/lib/firebase-admin';
import type { DocumentReference } from 'firebase-admin/firestore';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: { bodyParser: false },
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
      filter: ({ mimetype }) => mimetype === 'application/pdf',
    });

    const [fields, files] = await form.parse(req);

    const nombre         = Array.isArray(fields.nombre)         ? fields.nombre[0]         : fields.nombre;
    const apellido       = Array.isArray(fields.apellido)       ? fields.apellido[0]       : fields.apellido;
    const dni            = Array.isArray(fields.dni)            ? fields.dni[0]            : fields.dni;
    const telefonoArea   = Array.isArray(fields.telefonoArea)   ? fields.telefonoArea[0]   : fields.telefonoArea;
    const telefonoNumero = Array.isArray(fields.telefonoNumero) ? fields.telefonoNumero[0] : fields.telefonoNumero;
    const fechaNacimiento= Array.isArray(fields.fechaNacimiento)? fields.fechaNacimiento[0]: fields.fechaNacimiento;
    const nivelFormacion = Array.isArray(fields.nivelFormacion) ? fields.nivelFormacion[0] : fields.nivelFormacion;
    const area           = (Array.isArray(fields.area) ? fields.area[0] : fields.area) || 'Genérico';
    const cvFile         = Array.isArray(files.cv) ? files.cv[0] : files.cv;

    // Validaciones
    if (!nombre||!apellido||!dni||!telefonoArea||!telefonoNumero||!fechaNacimiento||!nivelFormacion||!cvFile) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (!/^\d{7,8}$/.test(dni)) {
      return res.status(400).json({ error: 'DNI inválido' });
    }
    if (!/^(\d{2})\/(\d{2})\/(\d{4})$/.test(fechaNacimiento)) {
      return res.status(400).json({ error: 'Formato de fecha inválido' });
    }

    const storage = getStorage();
    const db      = getFirestore();

    // Buscar CV existente con el mismo DNI
    console.log('🔍 Buscando CVs existentes con DNI:', dni);
    const existingQuery = await db.collection('cvs').where('dni', '==', dni).get();

    let replacedCV    = false;
    let existingDocId: string | null = null;
    let preservedData: Record<string, any> = {};

    if (!existingQuery.empty) {
      const oldCV     = existingQuery.docs[0];
      const oldData   = oldCV.data();
      existingDocId   = oldCV.id;
      const wasDiscarded = oldData.estadoSeleccion === 'Descartado';

      console.log(wasDiscarded
        ? `⚠️ DNI ${dni} pertenece a un candidato DESCARTADO (${oldData.motivoDescarte}). Se acepta la carga pero se marcará la alerta.`
        : `⚠️ DNI ${dni} ya existe. Actualizando PDF sin perder estado de selección.`
      );

      if (wasDiscarded) {
        // Candidato fue descartado antes: acepta la carga pero pone bandera de alerta
        // NO preservar estadoSeleccion ni motivoDescarte en el nuevo estado activo.
        // El CV se incorpora como nuevo a "Todos los CVs" pero con la alerta visible.
        preservedData = {
          repostulacionDescartado: true,
          motivoDescarteAnterior:  oldData.motivoDescarte || 'Sin motivo registrado',
          // Limpiar estado de selección para que aparezca en "Todos los CVs"
          puestoSeleccionado: '',
          estadoSeleccion:    '',
          notasAdmin:         '',
          fechaSeleccion:     '',
          motivoDescarte:     '',
        };
      } else {
        // CV normal: preservar estado de selección activo
        if (oldData.puestoSeleccionado) {
          preservedData = {
            puestoSeleccionado:      oldData.puestoSeleccionado,
            estadoSeleccion:         oldData.estadoSeleccion    || '',
            notasAdmin:              oldData.notasAdmin         || '',
            fechaSeleccion:          oldData.fechaSeleccion     || '',
            motivoDescarte:          '',
            repostulacionDescartado: false,
            motivoDescarteAnterior:  '',
          };
          console.log('🔒 Estado de selección preservado:', oldData.estadoSeleccion);
        }
      }

      // Eliminar PDF anterior de Storage
      if (oldData.cvStoragePath) {
        try {
          await storage.bucket(bucketName).file(oldData.cvStoragePath).delete();
          console.log('✅ PDF anterior eliminado de Storage');
        } catch (err) {
          console.warn('⚠️ No se pudo eliminar el PDF anterior:', err);
        }
      }

      replacedCV = true;
    }

    // Subir nuevo PDF
    const timestamp   = Date.now();
    const safeFile    = cvFile.originalFilename?.replace(/[^a-zA-Z0-9.-]/g,'_') || 'cv.pdf';
    const fileName    = `cvs/${timestamp}_${dni}_${safeFile}`;

    console.log('📤 Subiendo PDF a Storage:', fileName);
    await storage.bucket(bucketName).upload(cvFile.filepath, {
      destination: fileName,
      metadata: {
        contentType: 'application/pdf',
        metadata: { uploadedBy: session.user.email!, nombre, apellido, dni },
      },
    });

    // URL firmada 10 años
    const file = storage.bucket(bucketName).file(fileName);
    const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 1000*60*60*24*365*10 });

    // Datos del documento
    const cvData = {
      nombre,
      apellido,
      dni,
      telefonoArea,
      telefonoNumero,
      fechaNacimiento,
      nivelFormacion,
      area,
      cvFileName:    cvFile.originalFilename || 'cv.pdf',
      cvStoragePath: fileName,
      cvUrl:         url,
      uploadedBy:    session.user.email,
      uploadedAt:    new Date().toISOString(),
      ...preservedData,
    };

    let docRef: DocumentReference;

    if (existingDocId) {
      console.log('💾 Actualizando documento existente:', existingDocId);
      await db.collection('cvs').doc(existingDocId).update(cvData);
      docRef = db.collection('cvs').doc(existingDocId);
    } else {
      console.log('💾 Creando nuevo documento...');
      docRef = await db.collection('cvs').add(cvData);
      console.log('✅ Creado con ID:', docRef.id);
    }

    // Limpiar temp
    try { fs.unlinkSync(cvFile.filepath); } catch {}

    const wasDiscardedRepost = preservedData.repostulacionDescartado === true;

    console.log('🎉 Upload completado. Repostulación de descartado:', wasDiscardedRepost);

    return res.status(200).json({
      success:               true,
      id:                    docRef.id,
      replaced:              replacedCV,
      repostulacionDescartado: wasDiscardedRepost,
      motivoDescarteAnterior:  wasDiscardedRepost ? preservedData.motivoDescarteAnterior : null,
      message: wasDiscardedRepost
        ? 'CV cargado. ATENCIÓN: este candidato fue descartado anteriormente.'
        : replacedCV
          ? 'CV actualizado exitosamente.'
          : 'CV subido exitosamente.',
    });

  } catch (error: any) {
    console.error('❌ Error al subir CV:', error);
    return res.status(500).json({
      error: 'Error al procesar el CV',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
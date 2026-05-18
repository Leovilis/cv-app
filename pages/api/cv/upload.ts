// pages/api/cv/upload.ts - Versión corregida (update en lugar de delete)

import type { NextApiRequest, NextApiResponse } from "next";
import { getStorage, getFirestore, bucketName } from "@/lib/firebase-admin";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 500 * 1024; // 500KB

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log("🚀 [UPLOAD] Iniciando handler...");
  console.log("📌 Método:", req.method);

  if (req.method !== "POST") {
    console.log("❌ Método no permitido:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("📤 Iniciando upload de CV");

    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
    });

    console.log("📋 Parseando formulario...");

    let fields: formidable.Fields;
    let files: formidable.Files;

    try {
      [fields, files] = await form.parse(req);
    } catch (parseError: any) {
      console.error("❌ Error al parsear formulario:", parseError.message);
      if (parseError.code === 1009 || /maxFileSize/i.test(parseError.message)) {
        return res.status(400).json({
          error: `El archivo PDF no debe superar los ${MAX_FILE_SIZE / 1024}KB`,
        });
      }
      return res.status(400).json({
        error: "Error al procesar el formulario: " + parseError.message,
      });
    }

    console.log("📦 Fields recibidos:", Object.keys(fields));
    console.log("📦 Files recibidos:", files.cv ? "CV presente" : "No hay CV");

    // Obtener campos del formulario
    const nombre = Array.isArray(fields.nombre)
      ? fields.nombre[0]
      : fields.nombre;
    const apellido = Array.isArray(fields.apellido)
      ? fields.apellido[0]
      : fields.apellido;
    const dni = Array.isArray(fields.dni) ? fields.dni[0] : fields.dni;
    const telefonoArea = Array.isArray(fields.telefonoArea)
      ? fields.telefonoArea[0]
      : fields.telefonoArea;
    const telefonoNumero = Array.isArray(fields.telefonoNumero)
      ? fields.telefonoNumero[0]
      : fields.telefonoNumero;
    const fechaNacimiento = Array.isArray(fields.fechaNacimiento)
      ? fields.fechaNacimiento[0]
      : fields.fechaNacimiento;
    const nivelFormacion = Array.isArray(fields.nivelFormacion)
      ? fields.nivelFormacion[0]
      : fields.nivelFormacion;
    const area = Array.isArray(fields.area)
      ? fields.area[0]
      : (fields.area ?? "");
    const subArea = Array.isArray(fields.subArea)
      ? fields.subArea[0]
      : (fields.subArea ?? "");
    const lugarResidencia = Array.isArray(fields.lugarResidencia)
      ? fields.lugarResidencia[0]
      : (fields.lugarResidencia ?? "");
    const email = Array.isArray(fields.email)
      ? fields.email[0]
      : (fields.email ?? "");
    const privacidadAceptada = Array.isArray(fields.privacidadAceptada)
      ? fields.privacidadAceptada[0] === "true"
      : false;
    const fechaAceptacion = Array.isArray(fields.fechaAceptacion)
      ? fields.fechaAceptacion[0]
      : new Date().toISOString();
    const busquedasPostuladasRaw = Array.isArray(fields.busquedasPostuladas)
      ? fields.busquedasPostuladas[0]
      : (fields.busquedasPostuladas ?? "[]");

    const cvFile: formidable.File | undefined = files.cv
      ? Array.isArray(files.cv)
        ? files.cv[0]
        : (files.cv as formidable.File)
      : undefined;

    let busquedasPostuladas: string[] = [];
    try {
      busquedasPostuladas = JSON.parse(busquedasPostuladasRaw as string);
      if (!Array.isArray(busquedasPostuladas)) busquedasPostuladas = [];
    } catch {
      busquedasPostuladas = [];
    }

    const tieneBusquedas = busquedasPostuladas.length > 0;

    console.log("👤 Datos recibidos:", {
      nombre,
      apellido,
      dni,
      area: area || "(vacío)",
      subArea: subArea || "(vacío)",
      nivelFormacion,
      lugarResidencia,
      tieneBusquedas,
      busquedasCount: busquedasPostuladas.length,
    });

    // VALIDACIONES
    const errors: string[] = [];

    if (!nombre) errors.push("Nombre es requerido");
    if (!apellido) errors.push("Apellido es requerido");
    if (!dni) errors.push("DNI es requerido");
    if (dni && !/^\d{7,8}$/.test(dni))
      errors.push("DNI inválido (debe tener 7 u 8 dígitos)");
    if (!telefonoArea) errors.push("Código de área es requerido");
    if (!telefonoNumero) errors.push("Número de teléfono es requerido");
    if (!fechaNacimiento) errors.push("Fecha de nacimiento es requerida");
    if (!nivelFormacion) errors.push("Nivel de formación es requerido");
    if (!lugarResidencia) errors.push("Lugar de residencia es requerido");
    if (!privacidadAceptada)
      errors.push("Debe aceptar la política de privacidad");

    if (!cvFile) {
      errors.push("CV es requerido");
    } else {
      if (cvFile.mimetype !== "application/pdf") {
        errors.push("Solo se permiten archivos PDF");
      }
      if (cvFile.size > MAX_FILE_SIZE) {
        errors.push(
          `El archivo PDF no debe superar los ${MAX_FILE_SIZE / 1024}KB`,
        );
      }
    }

    if (
      fechaNacimiento &&
      !/^(\d{2})\/(\d{2})\/(\d{4})$/.test(fechaNacimiento as string)
    ) {
      errors.push("Formato de fecha inválido. Use DD/MM/YYYY");
    }

    if (!tieneBusquedas) {
      if (!area)
        errors.push(
          "Área es requerida cuando no se selecciona búsqueda activa",
        );
      if (!subArea)
        errors.push(
          "Puesto es requerido cuando no se selecciona búsqueda activa",
        );
    }

    if (errors.length > 0) {
      console.error("❌ Errores de validación:", errors);
      return res.status(400).json({ error: errors.join(", ") });
    }

    console.log("✅ Validaciones pasadas");

    const storage = getStorage();
    const db = getFirestore();

    // 🔽 BUSCAR CV EXISTENTE - NO ELIMINAR, ACTUALIZAR
    console.log("🔍 Buscando CVs existentes con DNI:", dni);
    const existingCVQuery = await db
      .collection("cvs")
      .where("dni", "==", dni)
      .get();

    let existingDocId: string | null = null;
    let existingData: any = null;

    if (!existingCVQuery.empty) {
      existingDocId = existingCVQuery.docs[0].id;
      existingData = existingCVQuery.docs[0].data();
      console.log("⚠️ Encontrado CV previo, se actualizará:", existingDocId);
    }

    // Subir archivo a Storage (si hay nuevo)
    let fileName = "";
    let url = "";

    if (cvFile) {
      const timestamp = Date.now();
      const safeFileName =
        cvFile.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, "_") || "cv.pdf";
      fileName = `cvs/${timestamp}_${dni}_${safeFileName}`;

      // Si existe archivo anterior, eliminarlo
      if (existingData?.cvStoragePath) {
        try {
          await storage
            .bucket(bucketName)
            .file(existingData.cvStoragePath)
            .delete();
          console.log("✅ Archivo anterior eliminado");
        } catch (err) {
          console.warn("⚠️ No se pudo eliminar el archivo anterior:", err);
        }
      }

      console.log("📤 Subiendo archivo a Storage:", fileName);
      await storage.bucket(bucketName).upload(cvFile.filepath, {
        destination: fileName,
        metadata: {
          contentType: "application/pdf",
          metadata: { uploadedBy: "candidato", nombre, apellido, dni },
        },
      });
      console.log("✅ Archivo subido a Storage");

      // Generar URL firmada
      const [signedUrl] = await storage
        .bucket(bucketName)
        .file(fileName)
        .getSignedUrl({
          action: "read",
          expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 10,
        });
      url = signedUrl;
      console.log("✅ URL firmada generada");
    } else if (existingData) {
      // Usar datos existentes si no hay nuevo archivo
      fileName = existingData.cvStoragePath || "";
      url = existingData.cvUrl || "";
    }

    // Obtener información de búsquedas activas
    let busquedasInfo: Array<{
      id: string;
      titulo: string;
      area: string;
      puesto: string;
      lugarResidencia: string;
    }> = [];

    if (busquedasPostuladas.length > 0) {
      for (const bId of busquedasPostuladas) {
        try {
          const busquedaDoc = await db
            .collection("busquedas_activas")
            .doc(bId)
            .get();
          if (busquedaDoc.exists) {
            const d = busquedaDoc.data()!;
            busquedasInfo.push({
              id: bId,
              titulo: d.titulo || "",
              area: d.area || "",
              puesto: d.puesto || "",
              lugarResidencia: d.lugarResidencia || "",
            });
          }
        } catch (err) {
          console.warn(`⚠️ Error al obtener búsqueda ${bId}:`, err);
        }
      }
      console.log("✅ Búsquedas activas encontradas:", busquedasInfo.length);
    }

    // Datos a guardar/actualizar
    const cvData = {
      nombre,
      apellido,
      dni,
      telefonoArea,
      telefonoNumero,
      fechaNacimiento,
      nivelFormacion,
      area: tieneBusquedas ? "" : area,
      subArea: tieneBusquedas ? "" : subArea,
      lugarResidencia,
      email: email || "",
      busquedasPostuladas,
      busquedasInfo,
      cvFileName:
        cvFile?.originalFilename || existingData?.cvFileName || "cv.pdf",
      cvStoragePath: fileName,
      cvUrl: url,
      uploadedBy: existingData?.uploadedBy || "candidato",
      uploadedAt: existingData?.uploadedAt || new Date().toISOString(),
      privacidadAceptada,
      fechaAceptacion,
      // Mantener estado de selección si ya tenía
      puestoSeleccionado: existingData?.puestoSeleccionado || "",
      estadoSeleccion: existingData?.estadoSeleccion || "En Curso",
      notasAdmin: existingData?.notasAdmin || "",
      createdAt: existingData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let docRef;
    if (existingDocId) {
      // ACTUALIZAR documento existente
      await db.collection("cvs").doc(existingDocId).update(cvData);
      docRef = { id: existingDocId };
      console.log("✅ CV actualizado en Firestore con ID:", existingDocId);
    } else {
      // CREAR nuevo documento
      docRef = await db.collection("cvs").add(cvData);
      console.log("✅ CV creado en Firestore con ID:", docRef.id);
    }

    // Limpiar archivo temporal
    if (cvFile) {
      try {
        fs.unlinkSync(cvFile.filepath);
        console.log("✅ Archivo temporal eliminado");
      } catch {
        console.warn("⚠️ No se pudo eliminar archivo temporal");
      }
    }

    console.log("🎉 Upload completado exitosamente");

    return res.status(200).json({
      success: true,
      id: existingDocId || docRef.id,
      message: existingDocId
        ? "CV actualizado exitosamente"
        : "CV subido exitosamente",
    });
  } catch (error: any) {
    console.error("❌ Error en el handler:", error);
    return res.status(500).json({
      error: "Error al procesar el CV",
      details: error.message,
    });
  }
}

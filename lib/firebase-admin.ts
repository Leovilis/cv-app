import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// Función para obtener las credenciales
const getServiceAccount = (): ServiceAccount => {
  // En producción (Vercel): usar variable de entorno JSON
  if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
      
      // Reemplazar \n literales con saltos de línea reales en la private_key
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
      
      console.log('✅ Using GOOGLE_CLOUD_CREDENTIALS from env');
      return credentials as ServiceAccount;
    } catch (error) {
      console.error('❌ Error parsing GOOGLE_CLOUD_CREDENTIALS:', error);
      throw new Error('Invalid GOOGLE_CLOUD_CREDENTIALS format');
    }
  }
  
  // En desarrollo local: usar archivo JSON
  try {
    const credentials = require('../service-account-key.json');
    console.log('✅ Using service-account-key.json from local file');
    return credentials as ServiceAccount;
  } catch (error) {
    console.error('❌ No credentials found. Add GOOGLE_CLOUD_CREDENTIALS env var or service-account-key.json file');
    throw new Error('Firebase credentials not configured');
  }
};

// Inicializar Firebase Admin solo una vez
if (!getApps().length) {
  try {
    const serviceAccount = getServiceAccount();
    
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
}

// Instancias de Storage y Firestore
const storageInstance = getAdminStorage();
const firestoreInstance = getAdminFirestore('cv-app');

// Exportaciones para compatibilidad con tus archivos API actuales
// Estas funciones devuelven las mismas instancias cada vez (patrón singleton)
export function getStorage() {
  return storageInstance;
}

export function getFirestore() {
  return firestoreInstance;
}

export const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '';

// Exportaciones adicionales para uso directo (opcional)
export const storage = storageInstance;
export const db = firestoreInstance;
export const bucket = storageInstance.bucket();

// Validar configuración
if (!bucketName) {
  console.warn('⚠️ GOOGLE_CLOUD_STORAGE_BUCKET not set');
}
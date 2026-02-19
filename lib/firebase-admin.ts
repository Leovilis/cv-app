import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

console.log('🔥 [FIREBASE-ADMIN] Module loading...');

// Función para obtener las credenciales
const getServiceAccount = (): ServiceAccount => {
  console.log('🔑 [FIREBASE-ADMIN] Getting credentials...');
  
  // En producción (Vercel): usar variable de entorno JSON
  if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
    try {
      console.log('🔑 [FIREBASE-ADMIN] Found GOOGLE_CLOUD_CREDENTIALS env var');
      const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
      
      // Reemplazar \n literales con saltos de línea reales en la private_key
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
      
      console.log('✅ [FIREBASE-ADMIN] Credentials parsed successfully');
      console.log('✅ [FIREBASE-ADMIN] Project ID:', credentials.project_id);
      return credentials as ServiceAccount;
    } catch (error) {
      console.error('❌ [FIREBASE-ADMIN] Error parsing GOOGLE_CLOUD_CREDENTIALS:', error);
      throw new Error('Invalid GOOGLE_CLOUD_CREDENTIALS format');
    }
  }
  
  // En desarrollo local: usar archivo JSON
  console.log('🔑 [FIREBASE-ADMIN] Trying local service-account-key.json...');
  try {
    const credentials = require('../service-account-key.json');
    console.log('✅ [FIREBASE-ADMIN] Using service-account-key.json from local file');
    return credentials as ServiceAccount;
  } catch (error) {
    console.error('❌ [FIREBASE-ADMIN] No credentials found anywhere!');
    throw new Error('Firebase credentials not configured - add GOOGLE_CLOUD_CREDENTIALS env var');
  }
};

// Inicializar Firebase Admin solo una vez
if (!getApps().length) {
  try {
    console.log('🚀 [FIREBASE-ADMIN] Initializing Firebase Admin...');
    const serviceAccount = getServiceAccount();
    
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
    });
    
    console.log('✅ [FIREBASE-ADMIN] Firebase Admin initialized successfully!');
  } catch (error) {
    console.error('❌ [FIREBASE-ADMIN] Initialization failed:', error);
    throw error;
  }
} else {
  console.log('ℹ️ [FIREBASE-ADMIN] Firebase Admin already initialized');
}

// Instancias de Storage y Firestore
console.log('📦 [FIREBASE-ADMIN] Creating service instances...');

let storageInstance: ReturnType<typeof getAdminStorage>;
let firestoreInstance: ReturnType<typeof getAdminFirestore>;

try {
  storageInstance = getAdminStorage();
  console.log('✅ [FIREBASE-ADMIN] Storage instance created');
} catch (error) {
  console.error('❌ [FIREBASE-ADMIN] Failed to create Storage:', error);
  throw error;
}

try {
  // Usar la base de datos 'cv-app' que sí existe en Firebase
  firestoreInstance = getAdminFirestore('cv-app');
  console.log('✅ [FIREBASE-ADMIN] Firestore instance created (database: cv-app)');
} catch (error) {
  console.error('❌ [FIREBASE-ADMIN] Failed to create Firestore:', error);
  throw error;
}

// Exportaciones para compatibilidad con tus archivos API actuales
export function getStorage() {
  console.log('📞 [FIREBASE-ADMIN] getStorage() called');
  return storageInstance;
}

export function getFirestore() {
  console.log('📞 [FIREBASE-ADMIN] getFirestore() called');
  return firestoreInstance;
}

export const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '';

// Exportaciones adicionales
export const storage = storageInstance;
export const db = firestoreInstance;
export const bucket = storageInstance.bucket();

// Validar configuración
if (!bucketName) {
  console.error('❌ [FIREBASE-ADMIN] GOOGLE_CLOUD_STORAGE_BUCKET not set!');
} else {
  console.log('✅ [FIREBASE-ADMIN] Bucket configured:', bucketName);
}

console.log('✅ [FIREBASE-ADMIN] Module loaded successfully!');
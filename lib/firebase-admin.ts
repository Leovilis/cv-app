import { initializeApp, getApps, cert, ServiceAccount, App } from 'firebase-admin/app';
import { getStorage as getAdminStorage, Storage } from 'firebase-admin/storage';
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore';

console.log('🔥 [FIREBASE-ADMIN] Module loaded (not initialized yet)');

let app: App | null = null;
let storageInstance: Storage | null = null;
let firestoreInstance: Firestore | null = null;
let initError: Error | null = null;

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
      console.log('✅ [FIREBASE-ADMIN] Client email:', credentials.client_email);
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
    console.error('❌ [FIREBASE-ADMIN] Available env vars:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
    throw new Error('Firebase credentials not configured - add GOOGLE_CLOUD_CREDENTIALS env var');
  }
};

// Función para inicializar Firebase Admin (lazy)
const ensureInitialized = () => {
  // Si ya falló antes, no reintentar
  if (initError) {
    console.error('❌ [FIREBASE-ADMIN] Previously failed, throwing cached error');
    throw initError;
  }

  // Si ya está inicializado, retornar
  if (app) {
    console.log('ℹ️ [FIREBASE-ADMIN] Already initialized');
    return;
  }

  console.log('🚀 [FIREBASE-ADMIN] Starting initialization...');
  
  try {
    const serviceAccount = getServiceAccount();
    
    // Verificar si ya existe una app inicializada
    const apps = getApps();
    if (apps.length > 0) {
      console.log('ℹ️ [FIREBASE-ADMIN] Found existing app, using it');
      app = apps[0];
    } else {
      console.log('🔥 [FIREBASE-ADMIN] Creating new Firebase Admin app');
      app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '',
      });
      console.log('✅ [FIREBASE-ADMIN] Firebase Admin initialized successfully!');
    }
  } catch (error) {
    console.error('❌ [FIREBASE-ADMIN] Initialization failed:', error);
    initError = error as Error;
    throw error;
  }
};

// Exportar función getStorage con lazy loading
export function getStorage(): Storage {
  console.log('📞 [FIREBASE-ADMIN] getStorage() called');
  
  if (!storageInstance) {
    console.log('📦 [FIREBASE-ADMIN] Creating Storage instance...');
    ensureInitialized();
    storageInstance = getAdminStorage();
    console.log('✅ [FIREBASE-ADMIN] Storage instance created');
  }
  
  return storageInstance;
}

// Exportar función getFirestore con lazy loading
export function getFirestore(): Firestore {
  console.log('📞 [FIREBASE-ADMIN] getFirestore() called');
  
  if (!firestoreInstance) {
    console.log('📦 [FIREBASE-ADMIN] Creating Firestore instance...');
    ensureInitialized();
    
    try {
      firestoreInstance = getAdminFirestore('cv-app');
      console.log('✅ [FIREBASE-ADMIN] Firestore instance created (database: cv-app)');
    } catch (error) {
      console.error('❌ [FIREBASE-ADMIN] Failed to create Firestore instance:', error);
      throw error;
    }
  }
  
  return firestoreInstance;
}

export const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '';

// Exportaciones lazy usando Proxy
export const storage = new Proxy({} as Storage, {
  get(_target, prop) {
    console.log(`📞 [FIREBASE-ADMIN] storage.${String(prop)} accessed`);
    const instance = getStorage();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    console.log(`📞 [FIREBASE-ADMIN] db.${String(prop)} accessed`);
    const instance = getFirestore();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export const bucket = new Proxy({} as any, {
  get(_target, prop) {
    console.log(`📞 [FIREBASE-ADMIN] bucket.${String(prop)} accessed`);
    const storage = getStorage();
    const bucketInstance = storage.bucket(bucketName);
    const value = (bucketInstance as any)[prop];
    return typeof value === 'function' ? value.bind(bucketInstance) : value;
  }
});

// Validar configuración
if (!bucketName) {
  console.warn('⚠️ [FIREBASE-ADMIN] GOOGLE_CLOUD_STORAGE_BUCKET not set');
} else {
  console.log('✅ [FIREBASE-ADMIN] Bucket name configured:', bucketName);
}

console.log('✅ [FIREBASE-ADMIN] Module setup complete (initialization will happen on first use)');
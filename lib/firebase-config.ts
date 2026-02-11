import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin solo si no está inicializado
if (!getApps().length) {
  initializeApp({
    credential: cert(require('../service-account-key.json')),
    storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
    databaseURL: `https://cv-app.firebaseio.com`, // Opcional, pero ayuda a Firebase Admin
  });
}

export const storage = getStorage();
export const db = getFirestore('cv-app'); // Especificar la base de datos personalizada
export const bucket = storage.bucket();
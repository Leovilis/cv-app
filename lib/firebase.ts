import { Storage } from '@google-cloud/storage';
import { Firestore } from '@google-cloud/firestore';

let storage: Storage | null = null;
let db: Firestore | null = null;

export const getStorage = () => {
  if (!storage) {
    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });
  }
  return storage;
};

export const getFirestore = () => {
  if (!db) {
    db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
      databaseId: 'cv-app', // Especificar la base de datos personalizada
    });
  }
  return db;
};

export const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET!;
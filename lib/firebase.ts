import { Storage } from '@google-cloud/storage';
import { Firestore } from '@google-cloud/firestore';

let storage: Storage | null = null;
let db: Firestore | null = null;

export const getStorage = () => {
  if (!storage) {
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS 
      ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
      : undefined;

    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials,
    });
  }
  return storage;
};

export const getFirestore = () => {
  if (!db) {
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS 
      ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
      : undefined;

    db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials,
      databaseId: 'cv-app',
    });
  }
  return db;
};

export const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '';
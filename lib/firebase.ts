import { Storage } from '@google-cloud/storage';
import { Firestore } from '@google-cloud/firestore';

let storage: Storage | null = null;
let db: Firestore | null = null;

const getCredentials = () => {
  if (!process.env.GOOGLE_CLOUD_CREDENTIALS) {
    return undefined;
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
    
    // Reemplazar \n literales con saltos de línea reales en la private_key
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
    
    return credentials;
  } catch (error) {
    console.error('Error parsing Google Cloud credentials:', error);
    return undefined;
  }
};

export const getStorage = () => {
  if (!storage) {
    const credentials = getCredentials();

    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials,
    });
  }
  return storage;
};

export const getFirestore = () => {
  if (!db) {
    const credentials = getCredentials();

    db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials,
      databaseId: 'cv-app',
    });
  }
  return db;
};

export const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '';
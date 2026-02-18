# 🔧 Guía de Configuración - Firebase en Vercel

## Problema actual
Tu app tiene credenciales de Firebase mal configuradas en Vercel, causando el error:
```
Error: Could not load the default credentials
```

## Solución en 3 pasos

### 📋 Paso 1: Obtener las credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **⚙️ Project Settings** → **Service Accounts**
4. Click en **"Generate new private key"**
5. Se descargará un archivo JSON (por ejemplo: `service-account-key.json`)

### 🔐 Paso 2: Configurar en Vercel

#### Opción A: Subir el JSON completo (RECOMENDADO)

1. Abre el archivo JSON que descargaste
2. Copia TODO el contenido (debe verse así):
   ```json
   {
     "type": "service_account",
     "project_id": "tu-proyecto-123",
     "private_key_id": "abc123...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com",
     ...
   }
   ```

3. Ve a tu proyecto en **Vercel** → **Settings** → **Environment Variables**

4. Agrega esta variable:
   - **Name:** `GOOGLE_CLOUD_CREDENTIALS`
   - **Value:** Pega TODO el JSON (en una sola línea está bien)
   - **Environments:** Marca Production, Preview, Development

5. Agrega también:
   - **Name:** `GOOGLE_CLOUD_STORAGE_BUCKET`
   - **Value:** `tu-bucket-name.appspot.com` (lo encuentras en Firebase Storage)

#### Opción B: Variables individuales (alternativa)

Si prefieres no poner el JSON completo, puedes usar variables separadas:
```
FIREBASE_PROJECT_ID=tu-proyecto-123
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n
```

Pero la Opción A es más sencilla.

### 📝 Paso 3: Actualizar tu código

**Reemplaza los archivos:**

1. **Elimina o renombra** estos archivos:
   - ❌ `lib/firebase.ts` (o donde esté)
   - ❌ `lib/firebase-config.ts` (o donde esté)

2. **Crea uno nuevo** `lib/firebase-admin.ts` con el contenido que te proporcioné

3. **Actualiza todos los imports** en tu código:

   **ANTES:**
   ```typescript
   import { db, storage, bucket } from '@/lib/firebase';
   // o
   import { db, storage, bucket } from '@/lib/firebase-config';
   ```

   **DESPUÉS:**
   ```typescript
   import { db, storage, bucket } from '@/lib/firebase-admin';
   ```

4. **Busca y reemplaza** en TODOS tus archivos API:
   - Busca: `from '@/lib/firebase'` o `from '../lib/firebase'`
   - Reemplaza: `from '@/lib/firebase-admin'` (ajusta la ruta según tu estructura)

### 🚀 Paso 4: Redeploy

1. Haz commit y push de los cambios
2. O en Vercel → Deployments → botón "Redeploy"
3. Verifica los logs para confirmar que ahora dice:
   ```
   ✅ Firebase Admin initialized successfully
   ```

---

## 🔍 Verificación

Para probar que funciona:

1. Intenta iniciar sesión con Google
2. Revisa los logs en Vercel (Runtime Logs)
3. Deberías ver: `✅ Firebase Admin initialized successfully`
4. NO deberías ver: `Could not load the default credentials`

---

## 📌 Notas importantes

- El archivo `service-account-key.json` **NUNCA** debe subirse a GitHub
- Agrega `service-account-key.json` a tu `.gitignore`
- En local, puedes usar el archivo JSON directamente
- En Vercel, DEBES usar la variable de entorno

---

## ❓ Problemas comunes

### Error: "private_key must be a string"
**Solución:** Asegúrate de que los saltos de línea en el `private_key` estén como `\n` literal en el JSON

### Error: "Invalid credentials"
**Solución:** Vuelve a copiar el JSON completo desde Firebase, asegúrate de no cortar ningún carácter

### Error: "Firebase app already exists"
**Solución:** El código ya maneja esto con `if (!getApps().length)`, pero si persiste, reinicia el servidor local

---

¿Necesitas ayuda con algún paso específico?

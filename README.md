# Manzur CV Bank - Banco de Curriculums

Sistema de gestión de CVs para Manzur Administraciones.

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd manzur-cv-bank
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa con tus datos:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<genera con: openssl rand -base64 32>

# Google OAuth
GOOGLE_CLIENT_ID=<tu_client_id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<tu_client_secret>

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=manzur-cv-bank
GOOGLE_CLOUD_KEY_FILE=./service-account-key.json
GOOGLE_CLOUD_STORAGE_BUCKET=manzur-cv-bank
```

### 4. Configurar Google Cloud

1. Sigue la guía completa en la documentación
2. Descarga el archivo `service-account-key.json`
3. Colócalo en la raíz del proyecto

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
manzur-cv-bank/
├── pages/
│   ├── api/           # Rutas API
│   ├── _app.tsx       # App wrapper
│   └── index.tsx      # Página principal
├── components/        # Componentes React
├── lib/              # Utilidades y tipos
├── styles/           # Estilos globales
└── public/           # Archivos estáticos
```

## 🔐 Usuarios

- **Usuario regular**: Cualquier email de Google puede cargar CVs
- **Administrador**: `sistemas@ddonpedrosrl.com` tiene acceso completo

## 📦 Deploy a Producción

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

Configura las variables de entorno en Vercel Dashboard.

## 🛠️ Scripts Disponibles

- `npm run dev` - Modo desarrollo
- `npm run build` - Compilar para producción
- `npm start` - Iniciar en producción
- `npm run lint` - Ejecutar linter

## 📝 Licencia

Privado - Manzur Administraciones

---
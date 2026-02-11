/**
 * Script para crear un usuario administrador en Firestore
 * 
 * Uso:
 *   node scripts/create-admin.js
 */

const { Firestore } = require('@google-cloud/firestore');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Configurar Firestore
const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'cv-app-484121',
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || './service-account-key.json',
  databaseId: 'cv-app',
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  console.log('\n=== Crear Usuario Administrador ===\n');

  try {
    // Solicitar datos
    const name = await question('Nombre completo: ');
    const email = await question('Email (ej: sistemas@ddonpedrosrl.com): ');
    const password = await question('Contraseña: ');
    const confirmPassword = await question('Confirmar contraseña: ');

    // Validaciones
    if (!email || !email.includes('@')) {
      console.error('❌ Email inválido');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('❌ Las contraseñas no coinciden');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ La contraseña debe tener al menos 6 caracteres');
      process.exit(1);
    }

    // Hashear contraseña
    console.log('\n⏳ Creando usuario...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar en Firestore
    await db.collection('admins').doc(email).set({
      name: name || 'Admin',
      email: email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      role: 'admin',
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log(`\n📧 Email: ${email}`);
    console.log('🔐 Contraseña: (la que ingresaste)\n');
    console.log('Ahora puedes iniciar sesión con estas credenciales.\n');

  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdmin();
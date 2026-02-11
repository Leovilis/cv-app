#!/bin/bash

echo "🚀 Instalando Manzur CV Bank..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo -e "${YELLOW}Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instálalo desde https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) instalado${NC}"

# 2. Instalar dependencias
echo -e "${YELLOW}Instalando dependencias...${NC}"
npm install
echo -e "${GREEN}✓ Dependencias instaladas${NC}"

# 3. Crear .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creando archivo .env.local...${NC}"
    cp .env.local.example .env.local
    echo -e "${GREEN}✓ Archivo .env.local creado${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita .env.local con tus credenciales${NC}"
else
    echo -e "${GREEN}✓ .env.local ya existe${NC}"
fi

# 4. Generar NEXTAUTH_SECRET
echo -e "${YELLOW}Generando NEXTAUTH_SECRET...${NC}"
SECRET=$(openssl rand -base64 32)
echo "Tu NEXTAUTH_SECRET generado: $SECRET"
echo "Agrégalo al archivo .env.local"

# 5. Verificar service-account-key.json
if [ ! -f service-account-key.json ]; then
    echo -e "${YELLOW}⚠️  service-account-key.json no encontrado${NC}"
    echo "Descárgalo desde Google Cloud Console y colócalo en la raíz del proyecto"
else
    echo -e "${GREEN}✓ service-account-key.json encontrado${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Instalación completa!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Pasos siguientes:"
echo "1. Edita .env.local con tus credenciales"
echo "2. Coloca service-account-key.json en la raíz"
echo "3. Ejecuta: npm run dev"
echo "4. Abre: http://localhost:3000"
echo ""

---
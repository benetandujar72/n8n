#!/bin/bash

# Adeptify Admin App - Script de Desplegament
# Autor: Benet Andújar (bandujar@edutac.es)

set -e

echo "🚀 Iniciant desplegament de l'Adeptify Admin App..."

# Colors per a output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funció per mostrar missatges
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Docker està instal·lat
check_docker() {
    log_info "Verificant instal·lació de Docker..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker no està instal·lat. Si us plau, instal·la Docker primer."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose no està instal·lat. Si us plau, instal·la Docker Compose primer."
        exit 1
    fi

    log_success "Docker i Docker Compose estan instal·lats"
}

# Crear fitxer .env si no existeix
create_env_file() {
    log_info "Configurant variables d'entorn..."

    if [ ! -f .env ]; then
        cat > .env << EOF
# Adeptify Admin App - Variables d'Entorn
# Si us plau, canvia aquestes contrasenyes en producció

# Base de Dades
POSTGRES_PASSWORD=adeptify_secure_password_2024
DATABASE_URL=postgresql://postgres:adeptify_secure_password_2024@postgres:5432/adeptify_admin

# Redis
REDIS_PASSWORD=adeptify_redis_password_2024
REDIS_URL=redis://:adeptify_redis_password_2024@redis:6379

# JWT Secrets (CANVIA AQUESTS EN PRODUCCIÓ!)
JWT_SECRET=adeptify_jwt_secret_key_2024_change_in_production
JWT_REFRESH_SECRET=adeptify_refresh_jwt_secret_key_2024_change_in_production

# Frontend
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# pgAdmin
PGADMIN_EMAIL=admin@adeptify.es
PGADMIN_PASSWORD=adeptify_admin_password_2024

# n8n Integration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@adeptify.es

# System Configuration
NODE_ENV=production
LOG_LEVEL=info
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
EOF
        log_success "Fitxer .env creat"
    else
        log_warning "El fitxer .env ja existeix. Si us plau, verifica la configuració."
    fi
}

# Construir i executar els containers
deploy_containers() {
    log_info "Construint i executant els containers..."

    # Aturar containers existents si hi ha
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

    # Construir i executar
    docker-compose -f docker-compose.prod.yml up -d --build

    log_success "Containers desplegats correctament"
}

# Esperar que els serveis estiguin preparats
wait_for_services() {
    log_info "Esperant que els serveis estiguin preparats..."

    # Esperar PostgreSQL
    log_info "Esperant PostgreSQL..."
    timeout 60 bash -c 'until docker exec adeptify_postgres pg_isready -U postgres; do sleep 2; done' || {
        log_error "PostgreSQL no s'ha iniciat correctament"
        exit 1
    }

    # Esperar Redis
    log_info "Esperant Redis..."
    timeout 30 bash -c 'until docker exec adeptify_redis redis-cli ping; do sleep 2; done' || {
        log_error "Redis no s'ha iniciat correctament"
        exit 1
    }

    # Esperar Backend
    log_info "Esperant Backend..."
    timeout 60 bash -c 'until curl -f http://localhost:3001/api/health; do sleep 5; done' || {
        log_error "Backend no s'ha iniciat correctament"
        exit 1
    }

    log_success "Tots els serveis estan preparats"
}

# Executar migracions i seed
setup_database() {
    log_info "Configurant la base de dades..."

    # Executar migracions
    docker exec adeptify_backend npx prisma db push

    # Executar seed
    docker exec adeptify_backend npx prisma db seed

    log_success "Base de dades configurada correctament"
}

# Mostrar informació final
show_final_info() {
    echo ""
    echo "🎉 Desplegament completat amb èxit!"
    echo ""
    echo "📋 Informació d'accés:"
    echo "   🌐 Aplicació Principal: http://localhost"
    echo "   🔧 API Backend: http://localhost:3001/api"
    echo "   🗄️  pgAdmin: http://localhost:5050"
    echo "   ⚙️  n8n: http://localhost:5678"
    echo ""
    echo "👤 Credencials d'accés:"
    echo "   📧 Email: bandujar@edutac.es"
    echo "   🔑 Contrasenya: 26@2705n8n"
    echo ""
    echo "🔒 Seguretat:"
    echo "   ⚠️  IMPORTANT: Canvia les contrasenyes per defecte en producció!"
    echo "   📝 Edita el fitxer .env per personalitzar la configuració"
    echo ""
    echo "📊 Comandaments útils:"
    echo "   📋 Veure logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   🛑 Aturar: docker-compose -f docker-compose.prod.yml down"
    echo "   🔄 Reiniciar: docker-compose -f docker-compose.prod.yml restart"
    echo ""
    echo "📞 Suport: bandujar@edutac.es"
    echo ""
}

# Funció principal
main() {
    echo "🐳 Adeptify Admin App - Script de Desplegament"
    echo "=============================================="
    echo ""

    check_docker
    create_env_file
    deploy_containers
    wait_for_services
    setup_database
    show_final_info
}

# Executar funció principal
main "$@"

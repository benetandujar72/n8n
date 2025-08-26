# Adeptify Admin App

Sistema d'administració complet per a la plataforma educativa Adeptify.es amb integració amb n8n per a avaluació automàtica.

## 🚀 Característiques

- **Frontend**: React + TypeScript + Tailwind CSS + WebSockets
- **Backend**: Node.js + Express + TypeScript + Socket.io
- **Base de Dades**: PostgreSQL amb Prisma ORM
- **Autenticació**: JWT + bcrypt amb múltiples nivells d'usuari
- **Integracions**: Moodle, Google Classroom, Google Drive, SIS
- **Avaluació Automàtica**: Integració amb n8n per a processament d'emails
- **Monitoratge**: Logs complets i auditoria d'activitats
- **Notificacions**: Sistema de notificacions en temps real

## 📋 Requisits

- Node.js 18+
- Docker i Docker Compose
- PostgreSQL (per a producció)
- Redis (per a producció)

## 🛠️ Instal·lació

### Desenvolupament Local

1. **Clonar el repositori**
```bash
git clone https://github.com/benetandujar72/n8n.git
cd n8n/adeptify-admin-app
```

2. **Instal·lar dependències**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configurar la base de dades**
```bash
cd ../backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

4. **Iniciar els servidors**
```bash
# Backend (en una terminal)
cd backend
npm run dev

# Frontend (en una altra terminal)
cd frontend
npm run dev
```

### Producció amb Docker

1. **Configurar variables d'entorn**
```bash
cp .env.example .env
# Editar .env amb les teves configuracions
```

2. **Construir i executar amb Docker Compose**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuració

### Variables d'Entorn

Crea un fitxer `.env` amb les següents variables:

```env
# Base de Dades
DATABASE_URL="postgresql://postgres:password@localhost:5432/adeptify_admin"
POSTGRES_PASSWORD=secure_password_change_in_production

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=redis_password_change_in_production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production

# Frontend
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# pgAdmin
PGADMIN_EMAIL=admin@adeptify.es
PGADMIN_PASSWORD=admin_password_change_in_production
```

### Estructura de Directoris

```
adeptify-admin-app/
├── backend/                 # API REST
│   ├── src/
│   │   ├── controllers/     # Controladors
│   │   ├── middleware/      # Middlewares
│   │   ├── routes/          # Rutes API
│   │   ├── services/        # Lògica de negoci
│   │   ├── utils/           # Utilitats
│   │   └── types/           # Tipus TypeScript
│   ├── prisma/              # Esquema de base de dades
│   └── package.json
├── frontend/                # Aplicació React
│   ├── src/
│   │   ├── components/      # Components UI
│   │   ├── pages/           # Pàgines
│   │   ├── services/        # Serveis API
│   │   ├── hooks/           # Hooks personalitzats
│   │   └── utils/           # Utilitats
│   └── package.json
├── docker/                  # Configuració Docker
├── scripts/                 # Scripts d'automatització
└── docs/                    # Documentació
```

## 👥 Usuaris i Permisos

### Nivells d'Usuari

1. **SuperAdministrador** (`SUPERADMIN`)
   - Accés complet a tot el sistema
   - Gestió de centres i administradors
   - Configuració global del sistema

2. **Administrador de Centre** (`ADMIN_CENTRE`)
   - Gestió del seu centre educatiu
   - Administració de cursos i usuaris del centre
   - Configuracions específiques del centre

3. **Administrador de Curs** (`ADMIN_CURS`)
   - Gestió del seu curs específic
   - Administració d'alumnes i professors
   - Configuracions del curs

### Usuari Inicial

- **Email**: `bandujar@edutac.es`
- **Contrasenya**: `26@2705n8n`
- **Rol**: SuperAdministrador

## 🔌 Integracions

### Sistemes Educatius Suportats

- **Moodle**: Importació d'usuaris i cursos
- **Google Classroom**: Sincronització de classes
- **Google Drive**: Gestió de fitxers i documents
- **SIS**: Integració amb sistemes d'informació d'estudiants

### n8n Workflows

El sistema inclou workflows preconfigurats per a:
- Processament automàtic d'emails amb tasques
- Avaluació automàtica amb IA
- Generació de feedback personalitzat
- Notificacions automàtiques

## 📊 Monitoratge i Logs

### Tipus de Logs

- **Activity Logs**: Registre de totes les accions dels usuaris
- **System Logs**: Logs del sistema i errors
- **API Logs**: Registre de totes les crides API
- **Security Logs**: Events de seguretat i autenticació

### Auditoria

El sistema manté un registre complet de:
- Creació, modificació i eliminació de registres
- Accés a recursos sensibles
- Canvis de configuració
- Intents d'accés fallits

## 🚀 Desplegament

### Producció

1. **Preparar el servidor**
```bash
# Instal·lar Docker i Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Desplegar l'aplicació**
```bash
git clone https://github.com/benetandujar72/n8n.git
cd n8n/adeptify-admin-app
docker-compose -f docker-compose.prod.yml up -d
```

3. **Configurar SSL (opcional)**
```bash
# Configurar certificats SSL
cp nginx/ssl/example.crt nginx/ssl/certificate.crt
cp nginx/ssl/example.key nginx/ssl/private.key
```

### URLs d'Accés

- **Aplicació Principal**: `http://localhost` o `https://tu-dominio.com`
- **API Backend**: `http://localhost:3001/api`
- **pgAdmin**: `http://localhost:5050`
- **n8n**: `http://localhost:5678`

## 🔒 Seguretat

### Mesures Implementades

- **Autenticació JWT** amb refresh tokens
- **Encriptació bcrypt** per a contrasenyes
- **Rate limiting** per a prevenir atacs
- **CORS** configurat adequadament
- **Validació d'entrada** amb express-validator
- **Sanitització** de dades d'entrada
- **Headers de seguretat** (HSTS, CSP, etc.)

### Recomanacions de Producció

1. Canviar totes les contrasenyes per defecte
2. Configurar certificats SSL
3. Configurar firewall
4. Implementar backup automàtic
5. Monitoritzar logs regularment

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📝 API Documentation

La documentació de l'API està disponible a:
- **Swagger UI**: `http://localhost:3001/api-docs`
- **Postman Collection**: `docs/postman/adeptify-admin-api.json`

## 🤝 Contribució

1. Fork el projecte
2. Crea una branca per a la teva feature (`git checkout -b feature/AmazingFeature`)
3. Commit els teus canvis (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branca (`git push origin feature/AmazingFeature`)
5. Obre un Pull Request

## 📄 Llicència

Aquest projecte està sota la llicència MIT. Vegeu el fitxer `LICENSE` per a més detalls.

## 📞 Suport

- **Email**: bandujar@edutac.es
- **Documentació**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/benetandujar72/n8n/issues)

## 🗺️ Roadmap

- [ ] Integració amb més sistemes educatius
- [ ] Dashboard analític avançat
- [ ] App mòbil
- [ ] IA per a recomanacions d'avaluació
- [ ] Sistema de backup automàtic
- [ ] Integració amb Microsoft Teams

---

**Desenvolupat per** [Benet Andújar](mailto:bandujar@edutac.es) per a [Adeptify.es](https://adeptify.es)

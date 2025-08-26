"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciant seed de la base de dades...');
    const hashedPassword = await bcryptjs_1.default.hash('26@2705n8n', 12);
    const superadmin = await prisma.user.upsert({
        where: { email: 'bandujar@edutac.es' },
        update: {},
        create: {
            email: 'bandujar@edutac.es',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Administrador',
            role: client_1.UserRole.SUPERADMIN,
            emailVerified: true,
        },
    });
    console.log('✅ Superadministrador creat:', superadmin.email);
    const centre = await prisma.centre.upsert({
        where: { codi: 'CENTRE001' },
        update: {},
        create: {
            nom: 'Institut d\'Educació Secundària Adeptify',
            codi: 'CENTRE001',
            emailDomain: 'adeptify.es',
            adreca: 'Carrer de l\'Educació, 123, Barcelona',
            telefon: '+34 93 123 45 67',
            status: client_1.CentreStatus.ACTIVE,
        },
    });
    console.log('✅ Centre creat:', centre.nom);
    const curs = await prisma.curs.upsert({
        where: { codi: 'CURS2024' },
        update: {},
        create: {
            nom: 'Curs Acadèmic 2024-2025',
            codi: 'CURS2024',
            anyAcademic: 2024,
            status: client_1.CursStatus.ACTIVE,
            centreId: centre.id,
        },
    });
    console.log('✅ Curs creat:', curs.nom);
    const assignatura = await prisma.assignatura.upsert({
        where: {
            codi_cursId: {
                codi: 'MAT001',
                cursId: curs.id
            }
        },
        update: {},
        create: {
            nom: 'Matemàtiques',
            codi: 'MAT001',
            credits: 6,
            cursId: curs.id,
        },
    });
    console.log('✅ Assignatura creat:', assignatura.nom);
    const professor = await prisma.professor.upsert({
        where: { email: 'professor@adeptify.es' },
        update: {},
        create: {
            email: 'professor@adeptify.es',
            nom: 'Joan',
            cognoms: 'García López',
            especialitat: 'Matemàtiques',
        },
    });
    console.log('✅ Professor creat:', professor.email);
    const alumne = await prisma.alumne.upsert({
        where: { email: 'alumne@adeptify.es' },
        update: {},
        create: {
            email: 'alumne@adeptify.es',
            nom: 'Maria',
            cognoms: 'Sánchez Pérez',
            dni: '12345678A',
            dataNaixement: new Date('2006-05-15'),
            centreId: centre.id,
            cursId: curs.id,
        },
    });
    console.log('✅ Alumne creat:', alumne.email);
    const rubrica = await prisma.rubrica.upsert({
        where: { id: 'rubrica-exemple' },
        update: {},
        create: {
            id: 'rubrica-exemple',
            nom: 'Rúbrica d\'Avaluació General',
            descripcio: 'Rúbrica estàndard per avaluar treballs escrits',
            criteris: [
                {
                    nom: 'Contingut i Comprensió',
                    descripcio: 'El treball demostra una comprensió profunda del tema',
                    pes: 0.4,
                    nivells: [
                        { nivell: 'Excel·lent', puntuacio: 4, descripcio: 'Comprensió excepcional i anàlisi detallada' },
                        { nivell: 'Bé', puntuacio: 3, descripcio: 'Comprensió adequada amb alguns detalls' },
                        { nivell: 'Suficient', puntuacio: 2, descripcio: 'Comprensió bàsica del tema' },
                        { nivell: 'Insuficient', puntuacio: 1, descripcio: 'Comprensió limitada o incorrecta' }
                    ]
                },
                {
                    nom: 'Organització i Estructura',
                    descripcio: 'El treball està ben organitzat i estructurat',
                    pes: 0.3,
                    nivells: [
                        { nivell: 'Excel·lent', puntuacio: 3, descripcio: 'Estructura clara i lògica' },
                        { nivell: 'Bé', puntuacio: 2, descripcio: 'Estructura adequada' },
                        { nivell: 'Suficient', puntuacio: 1, descripcio: 'Estructura bàsica' },
                        { nivell: 'Insuficient', puntuacio: 0, descripcio: 'Falta d\'organització' }
                    ]
                },
                {
                    nom: 'Expressió i Llenguatge',
                    descripcio: 'Ús correcte del llenguatge i expressió clara',
                    pes: 0.2,
                    nivells: [
                        { nivell: 'Excel·lent', puntuacio: 2, descripcio: 'Llenguatge precís i expressió clara' },
                        { nivell: 'Bé', puntuacio: 1.5, descripcio: 'Llenguatge adequat' },
                        { nivell: 'Suficient', puntuacio: 1, descripcio: 'Llenguatge bàsic' },
                        { nivell: 'Insuficient', puntuacio: 0, descripcio: 'Errors de llenguatge' }
                    ]
                },
                {
                    nom: 'Creativitat i Originalitat',
                    descripcio: 'Aportacions originals i creatives',
                    pes: 0.1,
                    nivells: [
                        { nivell: 'Excel·lent', puntuacio: 1, descripcio: 'Aportacions molt originals' },
                        { nivell: 'Bé', puntuacio: 0.75, descripcio: 'Algunes aportacions originals' },
                        { nivell: 'Suficient', puntuacio: 0.5, descripcio: 'Aportacions bàsiques' },
                        { nivell: 'Insuficient', puntuacio: 0, descripcio: 'Falta d\'originalitat' }
                    ]
                }
            ],
            puntuacioMaxima: 10,
            assignaturaId: assignatura.id,
        },
    });
    console.log('✅ Rúbrica creat:', rubrica.nom);
    const configuracions = [
        {
            clau: 'SYSTEM_NAME',
            valor: 'Adeptify Admin',
            descripcio: 'Nom del sistema d\'administració',
            encriptat: false,
        },
        {
            clau: 'SYSTEM_VERSION',
            valor: '1.0.0',
            descripcio: 'Versió del sistema',
            encriptat: false,
        },
        {
            clau: 'DEFAULT_LANGUAGE',
            valor: 'ca',
            descripcio: 'Idioma per defecte del sistema',
            encriptat: false,
        },
        {
            clau: 'MAX_FILE_SIZE',
            valor: '10485760',
            descripcio: 'Mida màxima de fitxers en bytes',
            encriptat: false,
        },
        {
            clau: 'SESSION_TIMEOUT',
            valor: '3600000',
            descripcio: 'Temps d\'expiració de sessió en mil·lisegons',
            encriptat: false,
        },
    ];
    for (const config of configuracions) {
        await prisma.configuracio.upsert({
            where: { clau: config.clau },
            update: {},
            create: config,
        });
    }
    console.log('✅ Configuracions globals creades');
    await prisma.notification.create({
        data: {
            titol: 'Benvingut a Adeptify Admin',
            missatge: 'El sistema d\'administració ha estat configurat correctament. Pots començar a gestionar centres, cursos i usuaris.',
            tipus: 'SUCCESS',
            userId: superadmin.id,
        },
    });
    console.log('✅ Notificació de benvinguda creada');
    console.log('🎉 Seed completat amb èxit!');
    console.log('');
    console.log('📋 Credencials d\'accés:');
    console.log('   Email: bandujar@edutac.es');
    console.log('   Contrasenya: 26@2705n8n');
    console.log('');
    console.log('🔗 URLs d\'accés:');
    console.log('   Frontend: http://localhost:2705');
    console.log('   Backend API: http://localhost:3001');
    console.log('   pgAdmin: http://localhost:5050');
    console.log('   MailHog: http://localhost:8025');
}
main()
    .catch((e) => {
    console.error('❌ Error durant el seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
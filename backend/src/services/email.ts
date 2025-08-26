import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

export const setupEmailService = async () => {
  try {
    // Configuració del transporter d'email
    transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });

    // Verificar connexió
    await transporter.verify();
    logger.info('✅ Servei d\'email configurat correctament');
  } catch (error) {
    logger.error('❌ Error configurant el servei d\'email:', error);
    logger.warn('Els emails no s\'enviaran fins que es configuri correctament el SMTP');
  }
};

export const sendEmail = async (options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}) => {
  if (!transporter) {
    logger.warn('Servei d\'email no configurat, no es pot enviar email');
    return false;
  }

  try {
    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || 'noreply@adeptify.es',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email enviat: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error enviant email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (user: { email: string; firstName: string; lastName: string }) => {
  const html = `
    <h1>Benvingut a Adeptify!</h1>
    <p>Hola ${user.firstName} ${user.lastName},</p>
    <p>El teu compte ha estat creat correctament.</p>
    <p>Pots accedir al sistema amb el teu email: <strong>${user.email}</strong></p>
    <p>Si tens alguna pregunta, no dubtis a contactar-nos.</p>
    <p>Salutacions,<br>L'equip d'Adeptify</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Benvingut a Adeptify',
    html,
  });
};

export const sendPasswordResetEmail = async (user: { email: string; firstName: string }, resetToken: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  const html = `
    <h1>Restabliment de contrasenya</h1>
    <p>Hola ${user.firstName},</p>
    <p>Has sol·licitat restablir la teva contrasenya.</p>
    <p>Fes clic al següent enllaç per restablir la teva contrasenya:</p>
    <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablir contrasenya</a></p>
    <p>Si no has sol·licitat aquest canvi, pots ignorar aquest email.</p>
    <p>Aquest enllaç expira en 1 hora.</p>
    <p>Salutacions,<br>L'equip d'Adeptify</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Restabliment de contrasenya - Adeptify',
    html,
  });
};

export const sendNotificationEmail = async (user: { email: string; firstName: string }, notification: {
  title: string;
  message: string;
  type: string;
}) => {
  const html = `
    <h1>${notification.title}</h1>
    <p>Hola ${user.firstName},</p>
    <p>${notification.message}</p>
    <p>Pots veure més detalls accedint al sistema d'administració.</p>
    <p>Salutacions,<br>L'equip d'Adeptify</p>
  `;

  return sendEmail({
    to: user.email,
    subject: `Notificació - ${notification.title}`,
    html,
  });
};

export const sendEvaluationCompleteEmail = async (user: { email: string; firstName: string }, evaluation: {
  studentName: string;
  assignmentName: string;
  score: number;
}) => {
  const html = `
    <h1>Avaluació completada</h1>
    <p>Hola ${user.firstName},</p>
    <p>L'avaluació de l'estudiant <strong>${evaluation.studentName}</strong> per l'assignació <strong>${evaluation.assignmentName}</strong> ha estat completada.</p>
    <p>Puntuació: <strong>${evaluation.score}/100</strong></p>
    <p>Pots veure els detalls complets accedint al sistema d'administració.</p>
    <p>Salutacions,<br>L'equip d'Adeptify</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Avaluació completada - Adeptify',
    html,
  });
};

export const sendSystemAlertEmail = async (alert: {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}) => {
  const severityColors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    critical: '#dc3545',
  };

  const html = `
    <h1 style="color: ${severityColors[alert.severity]}">${alert.title}</h1>
    <p><strong>Severitat:</strong> ${alert.severity.toUpperCase()}</p>
    <p>${alert.message}</p>
    <p>Si us plau, revisa el sistema d'administració per més detalls.</p>
    <p>Salutacions,<br>L'equip d'Adeptify</p>
  `;

  // Enviar a administradors del sistema
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

  if (adminEmails.length > 0) {
    return sendEmail({
      to: adminEmails,
      subject: `Alerta del sistema - ${alert.title}`,
      html,
    });
  }

  return false;
};

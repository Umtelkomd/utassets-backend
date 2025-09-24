import nodemailer from 'nodemailer';
import { User } from '../entity/User';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER || '',
                pass: process.env.EMAIL_PASS || ''
            }
        });
    }

    async sendEmailConfirmation(user: User, confirmationToken: string, isResend: boolean = false): Promise<boolean> {
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const confirmationUrl = `${frontendUrl}/confirm-email?token=${confirmationToken}`;

            // Log para debuggear la URL generada
            console.log(`🔗 URL de confirmación generada: ${confirmationUrl}`);
            console.log(`📧 Enviando correo a: ${user.email}`);

            const subject = isResend
                ? 'Nuevo enlace de confirmación - UT Assets'
                : 'Confirma tu cuenta en UT Assets';

            const welcomeText = isResend
                ? `¡Hola de nuevo ${user.fullName}!`
                : `¡Bienvenido ${user.fullName}!`;

            const instructionText = isResend
                ? 'Hemos generado un nuevo enlace de confirmación para tu cuenta. Para completar la activación de tu cuenta, haz clic en el siguiente enlace:'
                : 'Gracias por registrarte en UT Assets. Para completar tu registro, haz clic en el siguiente enlace:';

            const mailOptions = {
                from: `"UT Assets" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: user.email,
                subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>${welcomeText}</h2>
                        <p>${instructionText}</p>
                        <a href="${confirmationUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirmar mi cuenta</a>
                        <p>O copia y pega este enlace en tu navegador:</p>
                        <p>${confirmationUrl}</p>
                        <p><strong>Importante:</strong> Este enlace expirará en 24 horas.</p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`📧 Correo de confirmación enviado a: ${user.email}`);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar correo de confirmación:', error);
            return false;
        }
    }

    async sendEmailConfirmed(user: User): Promise<boolean> {
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const loginUrl = `${frontendUrl}/login`;

            const mailOptions = {
                from: `"UT Assets" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: user.email,
                subject: '✅ Cuenta confirmada - UT Assets',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>¡Cuenta confirmada exitosamente!</h2>
                        <p>¡Hola ${user.fullName}!</p>
                        <p>Tu cuenta ha sido confirmada. Ya puedes iniciar sesión:</p>
                        <a href="${loginUrl}" style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Iniciar Sesión</a>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`📧 Correo de confirmación exitosa enviado a: ${user.email}`);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar correo de confirmación exitosa:', error);
            return false;
        }
    }

    async sendPasswordReset(user: User, resetToken: string): Promise<boolean> {
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const resetUrl = `${frontendUrl}/reset-password-confirm?token=${resetToken}`;

            console.log(`🔗 URL de recuperación generada: ${resetUrl}`);
            console.log(`📧 Enviando correo de recuperación a: ${user.email}`);

            const mailOptions = {
                from: `"UT Assets" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Recuperación de contraseña - UT Assets',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>Recuperación de contraseña</h2>
                        <p>¡Hola ${user.fullName}!</p>
                        <p>Has solicitado restablecer tu contraseña. Para continuar, haz clic en el siguiente enlace:</p>
                        <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer contraseña</a>
                        <p>O copia y pega este enlace en tu navegador:</p>
                        <p>${resetUrl}</p>
                        <p><strong>Importante:</strong> Este enlace expirará en 1 hora.</p>
                        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`📧 Correo de recuperación enviado a: ${user.email}`);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar correo de recuperación:', error);
            return false;
        }
    }

    async sendPasswordResetConfirmation(user: User): Promise<boolean> {
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const loginUrl = `${frontendUrl}/login`;

            const mailOptions = {
                from: `"UT Assets" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: user.email,
                subject: '✅ Contraseña restablecida - UT Assets',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>¡Contraseña restablecida exitosamente!</h2>
                        <p>¡Hola ${user.fullName}!</p>
                        <p>Tu contraseña ha sido cambiada correctamente. Ya puedes iniciar sesión con tu nueva contraseña:</p>
                        <a href="${loginUrl}" style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Iniciar Sesión</a>
                        <p>Si no realizaste este cambio, contacta inmediatamente al administrador del sistema.</p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`📧 Correo de confirmación de cambio de contraseña enviado a: ${user.email}`);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar correo de confirmación de cambio de contraseña:', error);
            return false;
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('✅ Conexión SMTP verificada correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error en la conexión SMTP:', error);
            return false;
        }
    }
}

export const emailService = new EmailService();

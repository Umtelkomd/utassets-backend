"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slackNotificationService = exports.SlackNotificationService = void 0;
const axios_1 = __importDefault(require("axios"));
const Vacation_1 = require("../entity/Vacation");
const slack_config_1 = require("../config/slack.config");
const dateUtils_1 = require("../utils/dateUtils");
class SlackNotificationService {
    constructor() {
        this.webhookUrl = slack_config_1.slackConfig.webhookUrl;
    }
    async sendVacationRequestNotification(data) {
        if (!slack_config_1.slackConfig.enabled) {
            console.log('📴 Notificaciones de Slack deshabilitadas');
            return;
        }
        if (!this.webhookUrl) {
            console.warn('⚠️ SLACK_WEBHOOK_URL no está configurado. Las notificaciones de Slack están deshabilitadas.');
            return;
        }
        try {
            const { user, dates, type, description } = data;
            // Formatear las fechas
            const formattedDates = this.formatDates(dates, type);
            const typeText = type === Vacation_1.VacationType.REST_DAY ? 'día(s) de descanso' : 'día(s) extra trabajado(s)';
            // Crear el mensaje para Slack
            const message = {
                text: '📅 Nueva Solicitud de Vacaciones',
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: '📅 Nueva Solicitud de Vacaciones'
                        }
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Solicitante:*\n${user.fullName}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Email:*\n${user.email}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Tipo:*\n${typeText}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Fecha(s):*\n${formattedDates}`
                            }
                        ]
                    }
                ]
            };
            // Agregar descripción si existe
            if (description && description.trim()) {
                message.blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Descripción:*\n${description}`
                    }
                });
            }
            // Agregar información sobre el proceso de aprobación
            message.blocks.push({
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: '⏳ Esta solicitud requiere aprobación de dos administradores para ser confirmada.'
                    }
                ]
            });
            // Enviar la notificación
            await axios_1.default.post(this.webhookUrl, message, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Notificación de Slack enviada correctamente');
        }
        catch (error) {
            console.error('❌ Error al enviar notificación de Slack:', error);
            // Logging más detallado para debugging
            if (error.response) {
                console.error('❌ Slack webhook error - Status:', error.response.status);
                console.error('❌ Slack webhook error - Data:', error.response.data);
                if (error.response.status === 403) {
                    console.error('🔐 El webhook de Slack parece ser inválido o haber expirado. Verifica SLACK_WEBHOOK_URL');
                }
                else if (error.response.status === 404) {
                    console.error('🔍 El endpoint del webhook no fue encontrado. Verifica la URL');
                }
            }
            else if (error.request) {
                console.error('❌ No se pudo conectar con Slack:', error.message);
            }
            else {
                console.error('❌ Error configurando la petición:', error.message);
            }
            // No lanzamos el error para que no afecte la creación de la vacación
        }
    }
    formatDates(dates, type) {
        // Asegurar que todas las fechas sean objetos Date
        const validDates = dates.map(date => {
            if (date instanceof Date) {
                return date;
            }
            else if (typeof date === 'string') {
                return new Date(date);
            }
            else {
                return new Date(date);
            }
        });
        if (validDates.length === 1) {
            return validDates[0].toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        else {
            const startDate = validDates[0];
            const endDate = validDates[validDates.length - 1];
            const start = startDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            });
            const end = endDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            // Calcular días laborables para mostrar información precisa
            const workingDays = (0, dateUtils_1.calculateWorkingDays)(startDate, endDate);
            const totalDays = validDates.length;
            if (type === Vacation_1.VacationType.REST_DAY) {
                // Para días de descanso, mostrar días laborables que se descontarán
                if (workingDays === totalDays) {
                    // Todos los días son laborables
                    return `${start} - ${end} (${workingDays} días laborables)`;
                }
                else {
                    // Hay fines de semana incluidos
                    return `${start} - ${end} (${workingDays} días laborables de ${totalDays} días totales)`;
                }
            }
            else {
                // Para días extra trabajados, mostrar días totales
                return `${start} - ${end} (${totalDays} días trabajados)`;
            }
        }
    }
    async sendVacationApprovedNotification(user, dates, type, approverName, isFullyApproved) {
        if (!slack_config_1.slackConfig.enabled) {
            console.log('📴 Notificaciones de Slack deshabilitadas');
            return;
        }
        if (!this.webhookUrl) {
            console.warn('⚠️ SLACK_WEBHOOK_URL no está configurado. Las notificaciones de Slack están deshabilitadas.');
            return;
        }
        try {
            const formattedDates = this.formatDates(dates, type);
            const typeText = type === Vacation_1.VacationType.REST_DAY ? 'día(s) de descanso' : 'día(s) extra trabajado(s)';
            const statusText = isFullyApproved
                ? '✅ *SOLICITUD COMPLETAMENTE APROBADA*'
                : '⏳ *PRIMERA APROBACIÓN RECIBIDA*';
            const message = {
                text: isFullyApproved ? '✅ Solicitud de Vacaciones Aprobada' : '⏳ Primera Aprobación de Vacaciones',
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: isFullyApproved ? '✅ Solicitud de Vacaciones Aprobada' : '⏳ Primera Aprobación de Vacaciones'
                        }
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: statusText
                        }
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Empleado:*\n${user.fullName}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Tipo:*\n${typeText}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Fecha(s):*\n${formattedDates}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Aprobado por:*\n${approverName}`
                            }
                        ]
                    }
                ]
            };
            if (!isFullyApproved) {
                message.blocks.push({
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: '⚠️ Se requiere una segunda aprobación de otro administrador para confirmar las vacaciones.'
                        }
                    ]
                });
            }
            await axios_1.default.post(this.webhookUrl, message, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Notificación de aprobación de Slack enviada correctamente');
        }
        catch (error) {
            console.error('❌ Error al enviar notificación de aprobación de Slack:', error);
            // Logging más detallado del error para debugging
            if (error.response) {
                console.error('❌ Error response status:', error.response.status);
                console.error('❌ Error response data:', error.response.data);
            }
            else if (error.request) {
                console.error('❌ Error request:', error.request);
            }
            else {
                console.error('❌ Error message:', error.message);
            }
        }
    }
    async sendVacationRejectedNotification(user, dates, type, rejectorName, reason) {
        if (!slack_config_1.slackConfig.enabled) {
            return;
        }
        try {
            const formattedDates = this.formatDates(dates, type);
            const typeText = type === Vacation_1.VacationType.REST_DAY ? 'día(s) de descanso' : 'día(s) extra trabajado(s)';
            const message = {
                text: '❌ Solicitud de Vacaciones Rechazada',
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: '❌ Solicitud de Vacaciones Rechazada'
                        }
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Empleado:*\n${user.fullName}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Tipo:*\n${typeText}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Fecha(s):*\n${formattedDates}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Rechazado por:*\n${rejectorName}`
                            }
                        ]
                    }
                ]
            };
            if (reason && reason.trim()) {
                message.blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Motivo del rechazo:*\n${reason}`
                    }
                });
            }
            await axios_1.default.post(this.webhookUrl, message, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Notificación de rechazo de Slack enviada correctamente');
        }
        catch (error) {
            console.error('❌ Error al enviar notificación de rechazo de Slack:', error);
        }
    }
}
exports.SlackNotificationService = SlackNotificationService;
exports.slackNotificationService = new SlackNotificationService();

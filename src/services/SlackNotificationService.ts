import axios from 'axios';
import { VacationType } from '../entity/Vacation';
import { User } from '../entity/User';
import { slackConfig } from '../config/slack.config';

export interface VacationNotificationData {
    user: User;
    dates: Date[];
    type: VacationType;
    description?: string;
}

export class SlackNotificationService {
    private readonly webhookUrl = slackConfig.webhookUrl;

    async sendVacationRequestNotification(data: VacationNotificationData): Promise<void> {
        if (!slackConfig.enabled) {
            return;
        }

        try {
            const { user, dates, type, description } = data;

            // Formatear las fechas
            const formattedDates = this.formatDates(dates);
            const typeText = type === VacationType.REST_DAY ? 'día(s) de descanso' : 'día(s) extra trabajado(s)';

            // Crear el mensaje para Slack
            const message: any = {
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
            await axios.post(this.webhookUrl, message, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Notificación de Slack enviada correctamente');
        } catch (error) {
            console.error('❌ Error al enviar notificación de Slack:', error);
            // No lanzamos el error para que no afecte la creación de la vacación
        }
    }

    private formatDates(dates: Date[]): string {
        // Asegurar que todas las fechas sean objetos Date
        const validDates = dates.map(date => {
            if (date instanceof Date) {
                return date;
            } else if (typeof date === 'string') {
                return new Date(date);
            } else {
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
        } else if (validDates.length === 2) {
            const start = validDates[0].toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            });
            const end = validDates[validDates.length - 1].toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            return `${start} - ${end} (${validDates.length} días)`;
        } else {
            const start = validDates[0].toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            });
            const end = validDates[validDates.length - 1].toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            return `${start} - ${end} (${validDates.length} días)`;
        }
    }

    async sendVacationApprovedNotification(user: User, dates: Date[], type: VacationType, approverName: string, isFullyApproved: boolean): Promise<void> {
        if (!slackConfig.enabled) {
            return;
        }

        if (!this.webhookUrl) {
            console.error('❌ webhookUrl no está configurado');
            return;
        }

        try {
            const formattedDates = this.formatDates(dates);
            const typeText = type === VacationType.REST_DAY ? 'día(s) de descanso' : 'día(s) extra trabajado(s)';

            const statusText = isFullyApproved
                ? '✅ *SOLICITUD COMPLETAMENTE APROBADA*'
                : '⏳ *PRIMERA APROBACIÓN RECIBIDA*';

            const message: any = {
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

            await axios.post(this.webhookUrl, message, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Notificación de aprobación de Slack enviada correctamente');
        } catch (error: any) {
            console.error('❌ Error al enviar notificación de aprobación de Slack:', error);

            // Logging más detallado del error para debugging
            if (error.response) {
                console.error('❌ Error response status:', error.response.status);
                console.error('❌ Error response data:', error.response.data);
            } else if (error.request) {
                console.error('❌ Error request:', error.request);
            } else {
                console.error('❌ Error message:', error.message);
            }
        }
    }

    async sendVacationRejectedNotification(user: User, dates: Date[], type: VacationType, rejectorName: string, reason?: string): Promise<void> {
        if (!slackConfig.enabled) {
            return;
        }

        try {
            const formattedDates = this.formatDates(dates);
            const typeText = type === VacationType.REST_DAY ? 'día(s) de descanso' : 'día(s) extra trabajado(s)';

            const message: any = {
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

            await axios.post(this.webhookUrl, message, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Notificación de rechazo de Slack enviada correctamente');
        } catch (error) {
            console.error('❌ Error al enviar notificación de rechazo de Slack:', error);
        }
    }
}

export const slackNotificationService = new SlackNotificationService(); 
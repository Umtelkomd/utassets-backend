const { WebClient } = require('@slack/web-api');

class SlackService {
  constructor() {
    this.client = null;
    this.channel = process.env.SLACK_CHANNEL || '#pagos-pendientes';
    this.isEnabled = false;
    
    // Inicializar cliente si hay token
    if (process.env.SLACK_BOT_TOKEN) {
      this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
      this.isEnabled = true;
    }
  }

  // Configurar Slack dinámicamente
  configure(botToken, channel) {
    if (botToken) {
      // Validar que sea un Bot Token
      if (!botToken.startsWith('xoxb-')) {
        console.error('Error: Se requiere un Bot Token (debe empezar con "xoxb-"), no un User Token.');
        this.isEnabled = false;
        return;
      }
      
      this.client = new WebClient(botToken);
      this.isEnabled = true;
    } else {
      this.isEnabled = false;
    }
    
    if (channel) {
      this.channel = channel;
    }
  }

  // Enviar notificación de nuevo pago
  async sendNewPaymentNotification(payment, centerName, createdByUser) {
    if (!this.isEnabled || !this.client) {
      console.log('Slack no está configurado. Notificación no enviada.');
      return;
    }

    try {
      const message = {
        channel: this.channel,
        text: `💰 Nuevo Pago Pendiente: ${payment.proveedor} - €${parseFloat(payment.monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '💰 Nuevo Pago Pendiente de Aprobación'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Proveedor:*\n${payment.proveedor}`
              },
              {
                type: 'mrkdwn',
                text: `*Monto:*\n€${parseFloat(payment.monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
              },
              {
                type: 'mrkdwn',
                text: `*Centro de Costo:*\n${centerName}`
              },
              {
                type: 'mrkdwn',
                text: `*Fecha:*\n${new Date(payment.fecha).toLocaleDateString('es-ES')}`
              },
              {
                type: 'mrkdwn',
                text: `*Creado por:*\n${createdByUser}`
              },
              {
                type: 'mrkdwn',
                text: `*Método de Pago:*\n${payment.metodoPago}`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Concepto:*\n${payment.concepto}`
            }
          }
        ]
      };

      // Agregar referencia si existe
      if (payment.referencia) {
        message.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Referencia:* ${payment.referencia}`
          }
        });
      }

      // Agregar comentarios si existen
      if (payment.comentarios) {
        message.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Comentarios:* ${payment.comentarios}`
          }
        });
      }

      // Agregar botón de acción (opcional)
      message.blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Ver en Sistema 🔗'
            },
            style: 'primary',
            url: `${process.env.FRONTEND_URL}/costcontrol/payment-approval`
          }
        ]
      });

      const result = await this.client.chat.postMessage(message);
      console.log('Notificación de Slack enviada:', result.ts);
      return result;
    } catch (error) {
      console.error('Error al enviar notificación de Slack:', error);
      throw error;
    }
  }

  // Enviar notificación de pago aprobado
  async sendPaymentApprovedNotification(payment, centerName, approvedByUser) {
    if (!this.isEnabled || !this.client) {
      return;
    }

    try {
      const message = {
        channel: this.channel,
        text: `✅ Pago Aprobado: ${payment.proveedor} - €${parseFloat(payment.monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '✅ Pago Aprobado'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Proveedor:*\n${payment.proveedor}`
              },
              {
                type: 'mrkdwn',
                text: `*Monto:*\n€${parseFloat(payment.monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
              },
              {
                type: 'mrkdwn',
                text: `*Centro de Costo:*\n${centerName}`
              },
              {
                type: 'mrkdwn',
                text: `*Aprobado por:*\n${approvedByUser}`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Concepto:* ${payment.concepto}`
            }
          }
        ]
      };

      const result = await this.client.chat.postMessage(message);
      console.log('Notificación de aprobación enviada:', result.ts);
      return result;
    } catch (error) {
      console.error('Error al enviar notificación de aprobación:', error);
      throw error;
    }
  }

  // Enviar notificación de pago diferido
  async sendPaymentDeferredNotification(payment, centerName, deferredByUser, reason) {
    if (!this.isEnabled || !this.client) {
      return;
    }

    try {
      const message = {
        channel: this.channel,
        text: `⏳ Pago Diferido: ${payment.proveedor} - €${parseFloat(payment.monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '⏳ Pago Diferido'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Proveedor:*\n${payment.proveedor}`
              },
              {
                type: 'mrkdwn',
                text: `*Monto:*\n€${parseFloat(payment.monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
              },
              {
                type: 'mrkdwn',
                text: `*Centro de Costo:*\n${centerName}`
              },
              {
                type: 'mrkdwn',
                text: `*Diferido por:*\n${deferredByUser}`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Concepto:* ${payment.concepto}`
            }
          }
        ]
      };

      // Agregar razón si existe
      if (reason) {
        message.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Razón:* ${reason}`
          }
        });
      }

      const result = await this.client.chat.postMessage(message);
      console.log('Notificación de diferimiento enviada:', result.ts);
      return result;
    } catch (error) {
      console.error('Error al enviar notificación de diferimiento:', error);
      throw error;
    }
  }

  // Probar conexión con Slack
  async testConnection() {
    if (!this.isEnabled || !this.client) {
      throw new Error('Slack no está configurado');
    }

    try {
      const result = await this.client.auth.test();
      console.log('Conexión con Slack exitosa:', result.team, result.user);
      return result;
    } catch (error) {
      console.error('Error al probar conexión con Slack:', error);
      
      // Mejorar mensajes de error específicos
      if (error.data && error.data.error) {
        switch (error.data.error) {
          case 'not_allowed_token_type':
            throw new Error('Tipo de token no válido. Necesitas un Bot Token (xoxb-...), no un User Token (xoxp-...)');
          case 'invalid_auth':
            throw new Error('Token de autenticación inválido. Verifica que el token sea correcto y esté activo.');
          case 'account_inactive':
            throw new Error('La cuenta de Slack está inactiva.');
          case 'token_revoked':
            throw new Error('El token ha sido revocado. Necesitas generar un nuevo Bot Token.');
          default:
            throw new Error(`Error de Slack: ${error.data.error}`);
        }
      }
      
      throw error;
    }
  }
}

// Crear instancia singleton
const slackService = new SlackService();

module.exports = slackService; 
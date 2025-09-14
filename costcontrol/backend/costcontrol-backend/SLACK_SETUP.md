# Configuración de Slack para Notificaciones

Este documento explica cómo configurar las notificaciones de Slack para el sistema de control de costos.

## Variables de Entorno (Opcional)

Puedes configurar Slack usando variables de entorno en el archivo `.env`:

```env
# Slack Configuration (opcional - puede configurarse desde la interfaz web)
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL=#pagos-pendientes

# Frontend URL (para enlaces en notificaciones de Slack)
FRONTEND_URL=http://localhost:3000
```

## Configuración desde la Interfaz Web

1. Ve a la página de "Configuración" en la aplicación
2. Busca la sección "Configuración de Slack"
3. Habilita las notificaciones de Slack
4. Sigue las instrucciones para obtener el Bot Token

## Cómo obtener el Bot Token de Slack

### ⚠️ IMPORTANTE: Tipos de Tokens

- **Bot Token** (`xoxb-...`): ✅ **CORRECTO** - Úsalo para este sistema
- **User Token** (`xoxp-...`): ❌ **INCORRECTO** - No funciona con este sistema

### Pasos para obtener el Bot Token:

1. Ve a [https://api.slack.com/apps](https://api.slack.com/apps)
2. **Crea una nueva app** o selecciona una existente
3. Ve a **"OAuth & Permissions"** en el menú lateral izquierdo
4. **Agrega estos permisos (Bot Token Scopes)**:
   - `chat:write` - Para enviar mensajes
   - `chat:write.public` - Para enviar mensajes a canales públicos
5. Haz clic en **"Install to Workspace"** 
6. **Autoriza la aplicación** en tu workspace
7. Copia el **"Bot User OAuth Token"** que empieza con `xoxb-`
8. **Invita al bot** al canal donde quieres recibir notificaciones:
   - Ve al canal en Slack
   - Escribe: `/invite @tu-bot-name`

## Tipos de Notificaciones

El sistema enviará notificaciones para:

- ✅ **Nuevo pago pendiente**: Cuando se crea un pago que requiere aprobación
- ✅ **Pago aprobado**: Cuando un pago es aprobado
- ⏳ **Pago diferido**: Cuando un pago es diferido a cuentas por pagar

## Formato de las Notificaciones

Las notificaciones incluyen:
- Proveedor
- Monto
- Centro de costo
- Fecha
- Método de pago
- Concepto
- Referencia (si existe)
- Comentarios (si existen)
- Usuario que realizó la acción
- Enlace directo al sistema

## Probar la Configuración

Usa el botón "Probar Conexión" en la página de configuración para:
- Verificar que el token es válido
- Confirmar que el bot puede enviar mensajes al canal
- Enviar un mensaje de prueba

## Solución de Problemas

### ❌ Error: `not_allowed_token_type`
**Causa**: Estás usando un User Token (`xoxp-`) en lugar de un Bot Token (`xoxb-`)

**Solución**: 
1. Ve a tu app en [api.slack.com/apps](https://api.slack.com/apps)
2. Ve a "OAuth & Permissions"
3. Copia el **"Bot User OAuth Token"** (NO el "User OAuth Token")
4. Asegúrate de que empiece con `xoxb-`

### ❌ Error: "Bot token es inválido"
**Causa**: El token no es válido o ha sido revocado

**Solución**:
- Verifica que el token empiece con `xoxb-`
- Asegúrate de que la app esté instalada en tu workspace
- Regenera el token si es necesario

### ❌ Error: "Canal no encontrado"
**Causa**: El bot no puede acceder al canal

**Solución**:
- Verifica que el canal existe
- **IMPORTANTE**: Invita al bot al canal manualmente:
  - Ve al canal en Slack
  - Escribe: `/invite @tu-bot-name`
- Usa el formato `#nombre-canal` para canales públicos
- Para canales privados, el bot debe ser invitado explícitamente

### ❌ Error: "Permisos insuficientes"
**Causa**: El bot no tiene los permisos necesarios

**Solución**:
1. Ve a "OAuth & Permissions" en tu app
2. En "Bot Token Scopes", agrega:
   - `chat:write`
   - `chat:write.public`
3. **Reinstala la app** en tu workspace
4. Copia el nuevo token si es necesario

### ❌ Error: "Token revocado"
**Causa**: El token ha sido invalidado

**Solución**:
1. Ve a "OAuth & Permissions"
2. Haz clic en "Reinstall to Workspace"
3. Copia el nuevo Bot Token
4. Actualiza la configuración en el sistema

## Deshabilitar Notificaciones

Para deshabilitar las notificaciones temporalmente:
1. Ve a la página de configuración
2. Desmarca "Habilitar notificaciones de Slack"
3. Guarda la configuración

Las notificaciones se deshabilitarán sin eliminar la configuración del token. 
const { AppDataSource } = require('../data-source');
const { Configuracion } = require('../entities/Configuracion');
const slackService = require('../services/slackService');

exports.getConfig = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Configuracion);
    let config = await repo.findOneBy({ id: 1 });
    
    // Si no existe configuración, crear una por defecto
    if (!config) {
      config = repo.create({
        nombreEmpresa: 'Umtelkomd GMBH',
        moneda: 'EUR',
        formatoFecha: 'DD/MM/YYYY',
        slackBotToken: null,
        slackChannel: '#pagos-pendientes',
        slackEnabled: false,
        ultimaActualizacion: new Date()
      });
      await repo.save(config);
    }
    
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Probar conexión con Slack
exports.testSlackConnection = async (req, res) => {
  try {
    const { botToken, channel } = req.body;
    
    if (!botToken) {
      return res.status(400).json({ error: 'Bot token es requerido' });
    }
    
    // Configurar temporalmente el servicio para la prueba
    slackService.configure(botToken, channel || '#pagos-pendientes');
    
    // Probar la conexión
    const result = await slackService.testConnection();
    
    // Enviar mensaje de prueba
    await slackService.sendNewPaymentNotification(
      {
        proveedor: 'Proveedor de Prueba',
        monto: 100.50,
        concepto: 'Esta es una prueba de configuración de Slack',
        fecha: new Date(),
        metodoPago: 'transferencia',
        referencia: 'TEST-001',
        comentarios: 'Mensaje de prueba - configuración exitosa'
      },
      'Centro de Prueba',
      'Sistema de Control de Costos'
    );
    
    res.json({ 
      success: true, 
      message: 'Conexión exitosa. Mensaje de prueba enviado.',
      team: result.team,
      user: result.user
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: 'Error al conectar con Slack: ' + err.message 
    });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Configuracion);
    let config = await repo.findOneBy({ id: 1 });
    
    // Si no existe configuración, crear una nueva
    if (!config) {
      config = repo.create({
        nombreEmpresa: 'Umtelkomd GMBH',
        moneda: 'EUR',
        formatoFecha: 'DD/MM/YYYY',
        slackBotToken: null,
        slackChannel: '#pagos-pendientes',
        slackEnabled: false,
        ultimaActualizacion: new Date()
      });
    }
    
    // Actualizar con los datos enviados
    repo.merge(config, req.body);
    config.ultimaActualizacion = new Date();
    
    // Si se está actualizando la configuración de Slack, configurar el servicio
    if (req.body.slackBotToken || req.body.slackChannel !== undefined) {
      try {
        slackService.configure(config.slackBotToken, config.slackChannel);
        
        // Si Slack está habilitado y hay token, probar la conexión
        if (config.slackEnabled && config.slackBotToken) {
          await slackService.testConnection();
        }
      } catch (slackError) {
        console.error('Error al configurar Slack:', slackError);
        // Deshabilitar Slack si hay error
        config.slackEnabled = false;
      }
    }
    
    await repo.save(config);
    
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
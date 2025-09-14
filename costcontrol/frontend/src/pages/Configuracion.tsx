import { useState, useEffect } from 'react';
import { useData } from '../lib/DataContext';
import apiClient from '../lib/axiosConfig';

const Configuracion: React.FC = () => {
  const { 
    getConfiguracion, 
    updateConfiguracion,
    isLoading
  } = useData();
  
  // Estados para el formulario
  const [nombreEmpresa, setNombreEmpresa] = useState<string>('');
  const [moneda, setMoneda] = useState<string>('EUR');
  const [formatoFecha, setFormatoFecha] = useState<string>('DD/MM/YYYY');
  
  // Estados para configuración de Slack
  const [slackBotToken, setSlackBotToken] = useState<string>('');
  const [slackChannel, setSlackChannel] = useState<string>('#pagos-pendientes');
  const [slackEnabled, setSlackEnabled] = useState<boolean>(false);
  
  // Estado para mensajes
  const [mensaje, setMensaje] = useState<{tipo: 'success' | 'error', texto: string} | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [probandoSlack, setProbandoSlack] = useState<boolean>(false);
  
  // Cargar configuración inicial
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getConfiguracion();
        if (config) {
          setNombreEmpresa(config.nombreEmpresa);
          setMoneda(config.moneda);
          setFormatoFecha(config.formatoFecha);
          setSlackBotToken(config.slackBotToken || '');
          setSlackChannel(config.slackChannel || '#pagos-pendientes');
          setSlackEnabled(config.slackEnabled || false);
        }
      } catch (err) {
        console.error('Error al cargar configuración:', err);
        setMensaje({
          tipo: 'error',
          texto: 'Error al cargar la configuración. Por favor, recarga la página.'
        });
      }
    };
    
    loadConfig();
  }, [getConfiguracion]);
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!nombreEmpresa) {
      setMensaje({
        tipo: 'error',
        texto: 'El nombre de la empresa es obligatorio.'
      });
      return;
    }
    
    // Validar token de Slack si está habilitado
    if (slackEnabled && slackBotToken && !slackBotToken.startsWith('xoxb-')) {
      setMensaje({
        tipo: 'error',
        texto: 'Error en configuración de Slack: Debes usar un Bot Token (empieza con "xoxb-"), no un User Token ("xoxp-").'
      });
      return;
    }
    
    try {
      setGuardando(true);
      
      // Actualizar configuración
      await updateConfiguracion({
        nombreEmpresa,
        moneda,
        formatoFecha,
        slackBotToken: slackBotToken || undefined,
        slackChannel,
        slackEnabled,
        ultimaActualizacion: new Date()
      });
      
      setMensaje({
        tipo: 'success',
        texto: 'Configuración guardada correctamente.'
      });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMensaje(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setMensaje({
        tipo: 'error',
        texto: 'Error al guardar la configuración. Inténtalo de nuevo.'
      });
    } finally {
      setGuardando(false);
    }
  };
  
  // Probar conexión con Slack
  const handleTestSlack = async () => {
    if (!slackBotToken) {
      setMensaje({
        tipo: 'error',
        texto: 'Por favor, ingresa un Bot Token de Slack.'
      });
      return;
    }
    
    // Validar que sea un Bot Token
    if (!slackBotToken.startsWith('xoxb-')) {
      setMensaje({
        tipo: 'error',
        texto: 'Error: Debes usar un Bot Token (empieza con "xoxb-"), no un User Token ("xoxp-").'
      });
      return;
    }
    
    try {
      setProbandoSlack(true);
      
      const response = await apiClient.post('/configuracion/test-slack', {
        botToken: slackBotToken,
        channel: slackChannel
      });
      
      const data = response.data;
      
      if (data.success) {
        setMensaje({
          tipo: 'success',
          texto: `✅ ${data.message} Conectado al equipo: ${data.team}`
        });
      } else {
        setMensaje({
          tipo: 'error',
          texto: data.error
        });
      }
      
    } catch (err) {
      setMensaje({
        tipo: 'error',
        texto: 'Error al probar la conexión con Slack.'
      });
    } finally {
      setProbandoSlack(false);
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setMensaje(null);
      }, 5000);
    }
  };

  // Restablecer configuración por defecto
  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que deseas restablecer la configuración a los valores por defecto?')) {
      setNombreEmpresa('Empresa de Fibra Óptica');
      setMoneda('EUR');
      setFormatoFecha('DD/MM/YYYY');
      setSlackBotToken('');
      setSlackChannel('#pagos-pendientes');
      setSlackEnabled(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando configuración...</div>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 border-b pb-2">Configuración del Sistema</h1>
      
      {/* Mensaje de éxito o error */}
      {mensaje && (
        <div className={`p-4 rounded ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {mensaje.texto}
        </div>
      )}
      
      {/* Formulario de configuración */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Configuración General</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dólar estadounidense ($)</option>
                <option value="GBP">Libra esterlina (£)</option>
                <option value="CHF">Franco suizo (CHF)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formato de Fecha
              </label>
              <select
                value={formatoFecha}
                onChange={(e) => setFormatoFecha(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
            >
              Restablecer Valores
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Configuración de Slack */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Configuración de Slack</h2>
        <div className="space-y-4">
          <p className="text-gray-700 text-sm">
            Configura las notificaciones de Slack para recibir alertas cuando se generen nuevos pagos pendientes de aprobación.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="slackEnabled"
                  checked={slackEnabled}
                  onChange={(e) => setSlackEnabled(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="slackEnabled" className="text-sm font-medium text-gray-700">
                  Habilitar notificaciones de Slack
                </label>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bot Token de Slack ⚠️ Debe empezar con <code className="bg-gray-100 px-1 rounded">xoxb-</code>
              </label>
              <input
                type="password"
                value={slackBotToken}
                onChange={(e) => setSlackBotToken(e.target.value)}
                placeholder="xoxb-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx"
                className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${
                  slackBotToken && !slackBotToken.startsWith('xoxb-') 
                    ? 'border-red-300 bg-red-50' 
                    : slackBotToken && slackBotToken.startsWith('xoxb-')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                }`}
                disabled={!slackEnabled}
              />
              {slackBotToken && (
                <div className="mt-1">
                  {slackBotToken.startsWith('xoxb-') ? (
                    <p className="text-xs text-green-600 flex items-center">
                      ✅ Bot Token válido
                    </p>
                  ) : slackBotToken.startsWith('xoxp-') ? (
                    <p className="text-xs text-red-600 flex items-center">
                      ❌ Este es un User Token. Necesitas un Bot Token (xoxb-...)
                    </p>
                  ) : (
                    <p className="text-xs text-orange-600 flex items-center">
                      ⚠️ Token no reconocido. Debe empezar con xoxb-
                    </p>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                <strong>IMPORTANTE:</strong> Necesitas un <strong>Bot Token</strong> (<code>xoxb-...</code>), NO un User Token (<code>xoxp-...</code>).
                <br />
                Obtén tu Bot Token desde <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://api.slack.com/apps</a>
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canal de Slack
              </label>
              <input
                type="text"
                value={slackChannel}
                onChange={(e) => setSlackChannel(e.target.value)}
                placeholder="#pagos-pendientes"
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                disabled={!slackEnabled}
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleTestSlack}
                disabled={!slackEnabled || !slackBotToken || probandoSlack}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {probandoSlack ? 'Probando conexión...' : 'Probar Conexión'}
              </button>
            </div>
          </div>
          
                      <div className="bg-blue-50 p-4 rounded border border-blue-200 mt-4">
              <h4 className="font-semibold text-blue-800 mb-2">¿Cómo configurar Slack?</h4>
              <ol className="text-blue-800 text-sm space-y-2 list-decimal list-inside">
                <li>Ve a <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="underline font-medium">api.slack.com/apps</a></li>
                <li><strong>Crea una nueva app</strong> o selecciona una existente</li>
                <li>Ve a <strong>"OAuth & Permissions"</strong> en el menú lateral izquierdo</li>
                <li>En <strong>"Bot Token Scopes"</strong> agregar: <code className="bg-blue-100 px-1 rounded">chat:write</code> y <code className="bg-blue-100 px-1 rounded">chat:write.public</code></li>
                <li>Haz clic en <strong>"Install to Workspace"</strong> y autoriza</li>
                <li>Copia el <strong>"Bot User OAuth Token"</strong> que empieza con <code className="bg-blue-100 px-1 rounded">xoxb-</code></li>
                <li><strong>IMPORTANTE:</strong> Ve al canal en Slack y escribe: <code className="bg-blue-100 px-1 rounded">/invite @tu-bot-name</code></li>
              </ol>
              
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-yellow-800 text-xs">
                  ⚠️ <strong>Error común:</strong> Si ves "not_allowed_token_type", estás usando un User Token (<code>xoxp-</code>) en lugar de un Bot Token (<code>xoxb-</code>).
                </p>
              </div>
            </div>
        </div>
      </div>
      
      {/* Información del sistema */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Información del Sistema</h2>
        <div className="space-y-2">
          <p><span className="font-semibold">Versión:</span> 1.0.0</p>
          <p><span className="font-semibold">Desarrollado por:</span> Sistema de Registro de Pagos</p>
          <p><span className="font-semibold">Fecha de implementación:</span> {new Date().toLocaleDateString('de-DE')}</p>
          <p><span className="font-semibold">Almacenamiento:</span> Local (IndexedDB)</p>
        </div>
      </div>
      
      {/* Exportación e importación de datos */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Gestión de Datos</h2>
        <div className="space-y-4">
          <p className="text-gray-700">
            Desde aquí puedes exportar todos los datos del sistema para realizar copias de seguridad o importar datos previamente exportados.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              onClick={() => alert('Funcionalidad de exportación completa en desarrollo')}
            >
              Exportar Todos los Datos
            </button>
            
            <button
              className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition-colors"
              onClick={() => alert('Funcionalidad de importación en desarrollo')}
            >
              Importar Datos
            </button>
            
            <button
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.')) {
                  alert('Funcionalidad de eliminación en desarrollo');
                }
              }}
            >
              Eliminar Todos los Datos
            </button>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200 mt-4">
            <p className="text-yellow-800 text-sm">
              <strong>Nota:</strong> La eliminación de datos es irreversible. Asegúrate de realizar una copia de seguridad antes de proceder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;

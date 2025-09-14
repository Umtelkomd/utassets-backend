import React, { useState, useEffect } from 'react';
import { useData, CentroCosto, CuentaPorPagar } from '../lib/DataContext';

const CuentasPorPagar: React.FC = () => {
  const { 
    getCuentasPorPagar, 
    addCuentaPorPagar, 
    updateCuentaPorPagar,
    deleteCuentaPorPagar, 
    getCentrosCosto, 
    getConfiguracion,
    exportToCSV,
    isLoading 
  } = useData();
  
  // Estados para el formulario
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaVencimiento, setFechaVencimiento] = useState<string>('');
  const [proveedor, setProveedor] = useState<string>('');
  const [concepto, setConcepto] = useState<string>('');
  const [monto, setMonto] = useState<string>('');
  const [centroCostoId, setCentroCostoId] = useState<string>('');
  const [comentarios, setComentarios] = useState<string>('');
  
  // Estados para la tabla y filtros
  const [cuentas, setCuentas] = useState<CuentaPorPagar[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<CentroCosto[]>([]);
  const [configData, setConfigData] = useState<any>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('pendientes'); // Por defecto solo pendientes
  const [filtroProveedor, setFiltroProveedor] = useState<string>('');
  const [filtroCentroCosto, setFiltroCentroCosto] = useState<string>('');
  
  // Estado para mensajes
  const [mensaje, setMensaje] = useState<{tipo: 'success' | 'error', texto: string} | null>(null);
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cuentasData, centrosData, configData] = await Promise.all([
          getCuentasPorPagar(),
          getCentrosCosto(),
          getConfiguracion()
        ]);
        
        // Ordenar cuentas por fecha de vencimiento (más próximas primero)
        const sortedCuentas = [...cuentasData].sort((a, b) => 
          new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()
        );
        
        // Actualizar estado de cuentas vencidas
        const hoy = new Date();
        const cuentasActualizadas: CuentaPorPagar[] = [];
        
        for (const cuenta of sortedCuentas) {
          if (cuenta.estado === 'pendiente' && new Date(cuenta.fechaVencimiento) < hoy) {
            // Crear una copia con el estado actualizado
            const cuentaActualizada: CuentaPorPagar = {
              ...cuenta,
              estado: 'vencida' as 'vencida' // Aseguramos que el tipo sea correcto
            };
            
            // Actualizar en la base de datos
            await updateCuentaPorPagar(cuenta.id, { estado: 'vencida' });
            
            cuentasActualizadas.push(cuentaActualizada);
          } else {
            cuentasActualizadas.push(cuenta);
          }
        }
        
        setCuentas(cuentasActualizadas);
        setCentrosCosto(centrosData);
        setConfigData(configData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setMensaje({
          tipo: 'error',
          texto: 'Error al cargar datos. Por favor, recarga la página.'
        });
      }
    };
    
    loadData();
  }, [getCuentasPorPagar, getCentrosCosto, getConfiguracion, updateCuentaPorPagar]);
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!fecha || !fechaVencimiento || !proveedor || !concepto || !monto || !centroCostoId) {
      setMensaje({
        tipo: 'error',
        texto: 'Todos los campos marcados con * son obligatorios.'
      });
      return;
    }
    
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setMensaje({
        tipo: 'error',
        texto: 'El monto debe ser un número positivo.'
      });
      return;
    }
    
    const fechaEmision = new Date(fecha);
    const fechaVenc = new Date(fechaVencimiento);
    const hoy = new Date();
    
    if (fechaEmision > hoy) {
      setMensaje({
        tipo: 'error',
        texto: 'La fecha de emisión no puede ser futura.'
      });
      return;
    }
    
    if (fechaVenc < fechaEmision) {
      setMensaje({
        tipo: 'error',
        texto: 'La fecha de vencimiento debe ser posterior a la fecha de emisión.'
      });
      return;
    }
    
    try {
      // Determinar estado inicial
      const estado = fechaVenc < hoy ? 'vencida' as const : 'pendiente' as const;
      
      // Crear nueva cuenta por pagar
      await addCuentaPorPagar({
        fecha: fechaEmision,
        fechaVencimiento: fechaVenc,
        proveedor,
        concepto,
        monto: montoNum,
        centroCostoId,
        estado,
        comentarios: comentarios || undefined
      });
      
      // Actualizar lista de cuentas
      const cuentasActualizadas = await getCuentasPorPagar();
      const sortedCuentas = [...cuentasActualizadas].sort((a, b) => 
        new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()
      );
      setCuentas(sortedCuentas);
      
      // Limpiar formulario
      setFecha(new Date().toISOString().split('T')[0]);
      setFechaVencimiento('');
      setProveedor('');
      setConcepto('');
      setMonto('');
      setCentroCostoId('');
      setComentarios('');
      
      // Mostrar mensaje de éxito
      setMensaje({
        tipo: 'success',
        texto: 'Cuenta por pagar registrada correctamente.'
      });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMensaje(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error al registrar cuenta por pagar:', err);
      setMensaje({
        tipo: 'error',
        texto: 'Error al registrar la cuenta por pagar. Inténtalo de nuevo.'
      });
    }
  };
  
  // Manejar cambio de estado
  const handleChangeEstado = async (id: string, nuevoEstado: 'pendiente' | 'pagada' | 'vencida') => {
    try {
      await updateCuentaPorPagar(id, { estado: nuevoEstado });
      
      // Actualizar lista de cuentas
      const cuentasActualizadas = await getCuentasPorPagar();
      const sortedCuentas = [...cuentasActualizadas].sort((a, b) => 
        new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()
      );
      setCuentas(sortedCuentas);
      
      setMensaje({
        tipo: 'success',
        texto: 'Estado actualizado correctamente.'
      });
      
      setTimeout(() => {
        setMensaje(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setMensaje({
        tipo: 'error',
        texto: 'Error al actualizar el estado. Inténtalo de nuevo.'
      });
    }
  };
  
  // Manejar eliminación de cuenta
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cuenta por pagar? Esta acción no se puede deshacer.')) {
      try {
        await deleteCuentaPorPagar(id);
        
        // Actualizar lista de cuentas
        const cuentasActualizadas = await getCuentasPorPagar();
        const sortedCuentas = [...cuentasActualizadas].sort((a, b) => 
          new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()
        );
        setCuentas(sortedCuentas);
        
        setMensaje({
          tipo: 'success',
          texto: 'Cuenta por pagar eliminada correctamente.'
        });
        
        setTimeout(() => {
          setMensaje(null);
        }, 3000);
        
      } catch (err) {
        console.error('Error al eliminar cuenta por pagar:', err);
        setMensaje({
          tipo: 'error',
          texto: 'Error al eliminar la cuenta por pagar. Inténtalo de nuevo.'
        });
      }
    }
  };
  
  // Filtrar cuentas
  const cuentasFiltradas = cuentas.filter(cuenta => {
    let estadoMatch = true;
    
    if (filtroEstado === 'pendientes') {
      // Solo mostrar pendientes y vencidas (que no están pagadas)
      estadoMatch = cuenta.estado === 'pendiente' || cuenta.estado === 'vencida';
    } else if (filtroEstado && filtroEstado !== 'todas') {
      estadoMatch = cuenta.estado === filtroEstado;
    }
    
    const proveedorMatch = !filtroProveedor || cuenta.proveedor.toLowerCase().includes(filtroProveedor.toLowerCase());
    const centroCostoMatch = !filtroCentroCosto || cuenta.centroCostoId === filtroCentroCosto;
    
    return estadoMatch && proveedorMatch && centroCostoMatch;
  });
  
  // Exportar a CSV
  const handleExportCSV = () => {
    const cuentasParaExportar = cuentasFiltradas.map(cuenta => {
      const centroCosto = centrosCosto.find(c => c.id === cuenta.centroCostoId);
      return {
        'Fecha Emisión': new Date(cuenta.fecha).toLocaleDateString('de-DE'),
        'Fecha Vencimiento': new Date(cuenta.fechaVencimiento).toLocaleDateString('de-DE'),
        Proveedor: cuenta.proveedor,
        Concepto: cuenta.concepto,
        Monto: cuenta.monto,
        'Centro de Costo': centroCosto?.nombre || 'N/A',
        Estado: cuenta.estado === 'pendiente' ? 'Pendiente' : cuenta.estado === 'pagada' ? 'Pagada' : 'Vencida',
        Comentarios: cuenta.comentarios || '',
        'Fecha de Registro': new Date(cuenta.createdAt).toLocaleDateString('de-DE')
      };
    });
    
    exportToCSV(cuentasParaExportar, 'cuentas_por_pagar');
  };
  
  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: configData?.moneda || 'EUR' 
    }).format(amount);
  };
  
  // Obtener clase de color según estado
  const getEstadoClass = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'pagada':
        return 'bg-green-100 text-green-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando datos...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-800 border-b pb-2">Cuentas por Pagar</h1>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            💡 <strong>Información:</strong> Las cuentas por pagar son facturas o compromisos de pago pendientes. 
            Una vez pagadas, se convierten en registros de "Gestión de Pagos".
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Por defecto se muestran solo las cuentas pendientes de pago (pendientes + vencidas).
          </p>
        </div>
      </div>
      
      {/* Mensaje de éxito o error */}
      {mensaje && (
        <div className={`p-4 rounded ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {mensaje.texto}
        </div>
      )}
      
      {/* Formulario de registro */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Nueva Cuenta por Pagar</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Emisión *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                min={fecha}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor *
              </label>
              <input
                type="text"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto (€) *
              </label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                step="0.01"
                min="0.01"
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Concepto *
              </label>
              <input
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Centro de Costo *
              </label>
              <select
                value={centroCostoId}
                onChange={(e) => setCentroCostoId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccionar...</option>
                {centrosCosto.map((centro) => (
                  <option key={centro.id} value={centro.id}>
                    {centro.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Registrar Cuenta por Pagar
            </button>
          </div>
        </form>
      </div>
      
      {/* Filtros y tabla de cuentas por pagar */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-800">Listado de Cuentas por Pagar</h2>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
            disabled={cuentasFiltradas.length === 0}
          >
            Exportar a CSV
          </button>
        </div>
        
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pendientes">🔄 Solo Pendientes (Por pagar)</option>
              <option value="todas">📋 Todas las cuentas</option>
              <option value="pendiente">⏳ Solo Pendientes</option>
              <option value="vencida">🚨 Solo Vencidas</option>
              <option value="pagada">✅ Solo Pagadas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Proveedor
            </label>
            <input
              type="text"
              value={filtroProveedor}
              onChange={(e) => setFiltroProveedor(e.target.value)}
              placeholder="Buscar..."
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Centro de Costo
            </label>
            <select
              value={filtroCentroCosto}
              onChange={(e) => setFiltroCentroCosto(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {centrosCosto.map((centro) => (
                <option key={centro.id} value={centro.id}>
                  {centro.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Tabla de cuentas por pagar */}
        {cuentasFiltradas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centro de Costo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cuentasFiltradas.map((cuenta) => {
                  const centroCosto = centrosCosto.find(c => c.id === cuenta.centroCostoId);
                  return (
                    <tr key={cuenta.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(cuenta.fechaVencimiento).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cuenta.proveedor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cuenta.concepto}
                        {cuenta.comentarios && (
                          <p className="text-xs text-gray-500 mt-1">{cuenta.comentarios}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {centroCosto?.nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(cuenta.monto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClass(cuenta.estado)}`}>
                          {cuenta.estado === 'pendiente' ? 'Pendiente' : cuenta.estado === 'pagada' ? 'Pagada' : 'Vencida'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {cuenta.estado !== 'pagada' && (
                            <button
                              onClick={() => handleChangeEstado(cuenta.id, 'pagada')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Marcar pagada
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(cuenta.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-4">
            No hay cuentas por pagar que coincidan con los filtros aplicados.
          </p>
        )}
      </div>
    </div>
  );
};

export default CuentasPorPagar;

import { useState, useEffect } from 'react';
import { useData } from '../lib/DataContext';
import { ExportCSVButton } from '../components/ExportCSVButton';

const Reportes: React.FC = () => {
  const { 
    getPagos, 
    getCuentasPorPagar, 
    getCentrosCosto,
    getConfiguracion,
    exportToCSV,
    isLoading
  } = useData();
  
  // Estados para datos
  const [pagos, setPagos] = useState<any[]>([]);
  const [cuentasPorPagar, setCuentasPorPagar] = useState<any[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any>(null);
  
  // Estados para filtros
  const [tipoReporte, setTipoReporte] = useState<string>('pagos-por-centro');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [centroCostoId, setCentroCostoId] = useState<string>('');
  
  // Estado para resultados
  const [resultados, setResultados] = useState<any[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState<boolean>(false);
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pagosData, cuentasData, centrosData, configData] = await Promise.all([
          getPagos(),
          getCuentasPorPagar(),
          getCentrosCosto(),
          getConfiguracion()
        ]);
        
        
        setPagos(pagosData);
        setCuentasPorPagar(cuentasData);
        setCentrosCosto(centrosData);
        setConfigData(configData);
        
        // Establecer fechas por defecto (último mes)
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        
        setFechaInicio(inicioMes.toISOString().split('T')[0]);
        setFechaFin(hoy.toISOString().split('T')[0]);
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    
    loadData();
  }, [getPagos, getCuentasPorPagar, getCentrosCosto, getConfiguracion]);
  
  // Generar reporte
  const generarReporte = () => {
    // Validar fechas
    if (!fechaInicio || !fechaFin) {
      alert('Por favor, selecciona un rango de fechas válido.');
      return;
    }
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59); // Incluir todo el día final
    
    if (inicio > fin) {
      alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }
        
    // Filtrar datos por fecha
    const pagosFiltrados = pagos.filter(pago => {
      const fechaPago = new Date(pago.fecha);
      return fechaPago >= inicio && fechaPago <= fin;
    });
    
    const cuentasFiltradas = cuentasPorPagar.filter(cuenta => {
      const fechaCuenta = new Date(cuenta.fecha);
      return fechaCuenta >= inicio && fechaCuenta <= fin;
    });
    
    
    // Generar reporte según tipo seleccionado
    let resultadosReporte: any[] = [];
    
    switch (tipoReporte) {
      case 'pagos-por-centro':
        resultadosReporte = generarReportePagosPorCentro(pagosFiltrados);
        break;
      case 'pagos-por-mes':
        resultadosReporte = generarReportePagosPorMes(pagosFiltrados);
        break;
      case 'cuentas-por-estado':
        resultadosReporte = generarReporteCuentasPorEstado(cuentasFiltradas);
        break;
      case 'centro-detallado':
        if (!centroCostoId) {
          alert('Por favor, selecciona un centro de costo.');
          return;
        }
        resultadosReporte = generarReporteCentroDetallado(pagosFiltrados, centroCostoId);
        break;
      default:
        resultadosReporte = [];
    }
    
    setResultados(resultadosReporte);
    setMostrarResultados(true);
  };
  
  // Generar reporte de pagos por centro de costo
  const generarReportePagosPorCentro = (pagosFiltrados: any[]) => {
    
    const resultados = centrosCosto.map(centro => {
      const pagosCentro = pagosFiltrados.filter(pago => pago.centroCostoId === centro.id);
      const totalCentro = pagosCentro.reduce((sum, pago) => {
        const monto = parseFloat(pago.monto) || 0;
        return sum + monto;
      }, 0);
      
      
      return {
        id: centro.id,
        nombre: centro.nombre,
        cantidadPagos: pagosCentro.length,
        total: totalCentro
      };
    });
    
    // Ordenar por total (mayor a menor)
    return resultados.sort((a, b) => b.total - a.total);
  };
  
  // Generar reporte de pagos por mes
  const generarReportePagosPorMes = (pagosFiltrados: any[]) => {
    const mesesMap = new Map();
    
    pagosFiltrados.forEach(pago => {
      const fecha = new Date(pago.fecha);
      const mesKey = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
      const mesNombre = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      
      if (!mesesMap.has(mesKey)) {
        mesesMap.set(mesKey, {
          mes: mesNombre,
          cantidadPagos: 0,
          total: 0
        });
      }
      
      const mesData = mesesMap.get(mesKey);
      mesData.cantidadPagos += 1;
      mesData.total += parseFloat(pago.monto) || 0;
      mesesMap.set(mesKey, mesData);
    });
    
    // Convertir Map a array y ordenar por fecha (más reciente primero)
    return Array.from(mesesMap.entries())
      .map(([key, value]) => ({ id: key, ...value }))
      .sort((a, b) => {
        const [yearA, monthA] = a.id.split('-').map(Number);
        const [yearB, monthB] = b.id.split('-').map(Number);
        
        if (yearA !== yearB) return yearB - yearA;
        return monthB - monthA;
      });
  };
  
  // Generar reporte de cuentas por estado
  const generarReporteCuentasPorEstado = (cuentasFiltradas: any[]) => {
    const pendientes = cuentasFiltradas.filter(cuenta => cuenta.estado === 'pendiente');
    const vencidas = cuentasFiltradas.filter(cuenta => cuenta.estado === 'vencida');
    const pagadas = cuentasFiltradas.filter(cuenta => cuenta.estado === 'pagada');
    
    const totalPendiente = pendientes.reduce((sum, cuenta) => sum + (parseFloat(cuenta.monto) || 0), 0);
    const totalVencido = vencidas.reduce((sum, cuenta) => sum + (parseFloat(cuenta.monto) || 0), 0);
    const totalPagado = pagadas.reduce((sum, cuenta) => sum + (parseFloat(cuenta.monto) || 0), 0);
    
    return [
      { id: 'pendiente', estado: 'Pendiente', cantidad: pendientes.length, total: totalPendiente },
      { id: 'vencida', estado: 'Vencida', cantidad: vencidas.length, total: totalVencido },
      { id: 'pagada', estado: 'Pagada', cantidad: pagadas.length, total: totalPagado }
    ];
  };
  
  // Generar reporte detallado de un centro de costo
  const generarReporteCentroDetallado = (pagosFiltrados: any[], centroId: string) => {
    const pagosCentro = pagosFiltrados.filter(pago => pago.centroCostoId === centroId);
    
    // Agrupar por proveedor
    const proveedoresMap = new Map();
    
    pagosCentro.forEach(pago => {
      if (!proveedoresMap.has(pago.proveedor)) {
        proveedoresMap.set(pago.proveedor, {
          proveedor: pago.proveedor,
          cantidadPagos: 0,
          total: 0,
          pagos: []
        });
      }
      
      const proveedorData = proveedoresMap.get(pago.proveedor);
      proveedorData.cantidadPagos += 1;
      proveedorData.total += parseFloat(pago.monto) || 0;
      proveedorData.pagos.push({
        fecha: new Date(pago.fecha).toLocaleDateString('es-ES'),
        concepto: pago.concepto,
        monto: parseFloat(pago.monto) || 0
      });
      
      proveedoresMap.set(pago.proveedor, proveedorData);
    });
    
    // Convertir Map a array y ordenar por total (mayor a menor)
    return Array.from(proveedoresMap.values())
      .sort((a, b) => b.total - a.total);
  };
  
  // Exportar resultados a CSV
  const exportarResultados = () => {
    if (resultados.length === 0) {
      alert('No hay resultados para exportar.');
      return;
    }
    
    let datosExportar: any[] = [];
    let nombreArchivo = 'reporte';
    
    switch (tipoReporte) {
      case 'pagos-por-centro':
        datosExportar = resultados.map(r => ({
          'Centro de Costo': r.nombre,
          'Cantidad de Pagos': r.cantidadPagos,
          'Total': r.total
        }));
        nombreArchivo = 'pagos_por_centro';
        break;
      case 'pagos-por-mes':
        datosExportar = resultados.map(r => ({
          'Mes': r.mes,
          'Cantidad de Pagos': r.cantidadPagos,
          'Total': r.total
        }));
        nombreArchivo = 'pagos_por_mes';
        break;
      case 'cuentas-por-estado':
        datosExportar = resultados.map(r => ({
          'Estado': r.estado,
          'Cantidad': r.cantidad,
          'Total': r.total
        }));
        nombreArchivo = 'cuentas_por_estado';
        break;
      case 'centro-detallado':
        const centro = centrosCosto.find(c => c.id === centroCostoId);
        datosExportar = resultados.map(r => ({
          'Proveedor': r.proveedor,
          'Cantidad de Pagos': r.cantidadPagos,
          'Total': r.total
        }));
        nombreArchivo = `centro_${centro?.nombre.toLowerCase().replace(/\s+/g, '_') || 'detallado'}`;
        break;
    }
    
    exportToCSV(datosExportar, nombreArchivo);
  };
  
  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: configData?.moneda || 'EUR' 
    }).format(amount);
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando datos...</div>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 border-b pb-2">Reportes</h1>
      
      {/* Formulario de filtros */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Generar Reporte</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Reporte
              </label>
              <select
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pagos-por-centro">Pagos por Centro de Costo</option>
                <option value="pagos-por-mes">Pagos por Mes</option>
                <option value="cuentas-por-estado">Cuentas por Estado</option>
                <option value="centro-detallado">Detalle de Centro de Costo</option>
              </select>
            </div>
            
            {tipoReporte === 'centro-detallado' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Centro de Costo
                </label>
                <select
                  value={centroCostoId}
                  onChange={(e) => setCentroCostoId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required={tipoReporte === 'centro-detallado'}
                >
                  <option value="">Seleccionar...</option>
                  {centrosCosto.map((centro) => (
                    <option key={centro.id} value={centro.id}>
                      {centro.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={generarReporte}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Generar Reporte
            </button>
          </div>
        </div>
      </div>
      
      {/* Resultados */}
      {mostrarResultados && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-800">Resultados</h2>
            <ExportCSVButton 
              onExport={exportarResultados} 
              disabled={resultados.length === 0}
            />
          </div>
          
          {resultados.length > 0 ? (
            <div className="overflow-x-auto">
              {tipoReporte === 'pagos-por-centro' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centro de Costo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad de Pagos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% del Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resultados.map((resultado) => {
                      const totalGeneral = resultados.reduce((sum, r) => sum + r.total, 0);
                      const porcentaje = totalGeneral > 0 
                        ? (resultado.total / totalGeneral) * 100 
                        : 0;
                      
                      return (
                        <tr key={resultado.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {resultado.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {resultado.cantidadPagos}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(resultado.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${porcentaje}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-500">
                                {porcentaje.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        TOTAL
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {resultados.reduce((sum, r) => sum + r.cantidadPagos, 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatCurrency(resultados.reduce((sum, r) => sum + r.total, 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        100%
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              
              {tipoReporte === 'pagos-por-mes' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad de Pagos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resultados.map((resultado) => (
                      <tr key={resultado.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {resultado.mes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resultado.cantidadPagos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(resultado.total)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        TOTAL
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {resultados.reduce((sum, r) => sum + r.cantidadPagos, 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatCurrency(resultados.reduce((sum, r) => sum + r.total, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              
              {tipoReporte === 'cuentas-por-estado' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% del Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resultados.map((resultado) => {
                      const totalGeneral = resultados.reduce((sum, r) => sum + r.total, 0);
                      const porcentaje = totalGeneral > 0 
                        ? (resultado.total / totalGeneral) * 100 
                        : 0;
                      
                      return (
                        <tr key={resultado.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              resultado.estado === 'Pendiente' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : resultado.estado === 'Vencida'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {resultado.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {resultado.cantidad}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(resultado.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    resultado.estado === 'Pendiente' 
                                      ? 'bg-yellow-500' 
                                      : resultado.estado === 'Vencida'
                                        ? 'bg-red-500'
                                        : 'bg-green-500'
                                  }`}
                                  style={{ width: `${porcentaje}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-500">
                                {porcentaje.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        TOTAL
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {resultados.reduce((sum, r) => sum + r.cantidad, 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatCurrency(resultados.reduce((sum, r) => sum + r.total, 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        100%
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              
              {tipoReporte === 'centro-detallado' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-blue-700">
                    {centrosCosto.find(c => c.id === centroCostoId)?.nombre || 'Centro de Costo'}
                  </h3>
                  
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad de Pagos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% del Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resultados.map((resultado, index) => {
                        const totalGeneral = resultados.reduce((sum, r) => sum + r.total, 0);
                        const porcentaje = totalGeneral > 0 
                          ? (resultado.total / totalGeneral) * 100 
                          : 0;
                        
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {resultado.proveedor}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {resultado.cantidadPagos}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(resultado.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${porcentaje}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-500">
                                  {porcentaje.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          TOTAL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {resultados.reduce((sum, r) => sum + r.cantidadPagos, 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatCurrency(resultados.reduce((sum, r) => sum + r.total, 0))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          100%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-4">
              No hay resultados para mostrar con los filtros seleccionados.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Reportes;

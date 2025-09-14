import { useState, useEffect } from 'react';
import { useData, Pago, CentroCosto, Configuracion, User } from '../lib/DataContext';

interface PagosProps {
  user: User;
}

const Pagos: React.FC<PagosProps> = ({ user }) => {
  const { 
    getPagos, 
    addPago, 
    deletePago, 
    getCentrosCosto, 
    getConfiguracion,
    exportToCSV,
    isLoading
  } = useData();
  
  // Estados para el formulario
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [proveedor, setProveedor] = useState<string>('');
  const [concepto, setConcepto] = useState<string>('');
  const [monto, setMonto] = useState<string>('');
  const [centroCostoId, setCentroCostoId] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<string>('transferencia');
  const [referencia, setReferencia] = useState<string>('');
  const [comentarios, setComentarios] = useState<string>('');
  
  // Estados para la tabla y filtros
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<CentroCosto[]>([]);
  const [configData, setConfigData] = useState<Configuracion | null>(null);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState<string>('');
  const [filtroFechaFin, setFiltroFechaFin] = useState<string>('');
  const [filtroProveedor, setFiltroProveedor] = useState<string>('');
  const [filtroCentroCosto, setFiltroCentroCosto] = useState<string>('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(15);
  
  // Estado para mensajes
  const [mensaje, setMensaje] = useState<{tipo: 'success' | 'error', texto: string} | null>(null);
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
          const [pagosData, centrosData, config] = await Promise.all([
            getPagos(),
            getCentrosCosto(),
            getConfiguracion()
          ]);
        
        // Ordenar pagos por fecha (más recientes primero)
        const sortedPagos = [...pagosData].sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        
          setPagos(sortedPagos);
          setCentrosCosto(centrosData);
          setConfigData(config || null);
        
        // Establecer filtros de fecha por defecto (último mes)
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        
        setFiltroFechaInicio(inicioMes.toISOString().split('T')[0]);
        setFiltroFechaFin(hoy.toISOString().split('T')[0]);
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setMensaje({
          tipo: 'error',
          texto: 'Error al cargar datos. Por favor, recarga la página.'
        });
      }
    };
    
    loadData();
  }, [getPagos, getCentrosCosto, getConfiguracion]);
  
  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [filtroFechaInicio, filtroFechaFin, filtroProveedor, filtroCentroCosto]);
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!fecha || !proveedor || !concepto || !monto || !centroCostoId || !metodoPago) {
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
    
    const fechaPago = new Date(fecha);
    const hoy = new Date();
    
    if (fechaPago > hoy) {
      setMensaje({
        tipo: 'error',
        texto: 'La fecha no puede ser futura.'
      });
      return;
    }
    
    try {
      // Crear nuevo pago
      await addPago({
        fecha: fechaPago,
        proveedor,
        concepto,
        monto: montoNum,
        centroCostoId,
        metodoPago,
        referencia: referencia || undefined,
        comentarios: comentarios || undefined,
        createdByUserId: user.id,
        status: user.role === 'approver' ? 'approved' : 'pending'
      });
      
      // Actualizar lista de pagos
      const pagosActualizados = await getPagos();
      const sortedPagos = [...pagosActualizados].sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      setPagos(sortedPagos);
      
      // Limpiar formulario
      setFecha(new Date().toISOString().split('T')[0]);
      setProveedor('');
      setConcepto('');
      setMonto('');
      setCentroCostoId('');
      setMetodoPago('transferencia');
      setReferencia('');
      setComentarios('');
      
      // Mostrar mensaje de éxito
      setMensaje({
        tipo: 'success',
        texto: user.role === 'approver' ? 'Pago registrado y aprobado automáticamente.' : 'Pago registrado correctamente.'
      });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMensaje(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setMensaje({
        tipo: 'error',
        texto: 'Error al registrar el pago. Inténtalo de nuevo.'
      });
    }
  };
  
  // Manejar eliminación de pago
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.')) {
      try {
        await deletePago(id);
        
        // Actualizar lista de pagos
        const pagosActualizados = await getPagos();
        const sortedPagos = [...pagosActualizados].sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        setPagos(sortedPagos);
        
        setMensaje({
          tipo: 'success',
          texto: 'Pago eliminado correctamente.'
        });
        
        setTimeout(() => {
          setMensaje(null);
        }, 3000);
        
      } catch (err) {
        console.error('Error al eliminar pago:', err);
        setMensaje({
          tipo: 'error',
          texto: 'Error al eliminar el pago. Inténtalo de nuevo.'
        });
      }
    }
  };
  
  // Filtrar pagos (excluir diferidos)
  const pagosFiltrados = pagos.filter(pago => {
    const fechaPago = new Date(pago.fecha);
    const fechaInicio = filtroFechaInicio ? new Date(filtroFechaInicio) : null;
    const fechaFin = filtroFechaFin ? new Date(filtroFechaFin) : null;
    
    if (fechaFin) fechaFin.setHours(23, 59, 59); // Incluir todo el día final
    
    const fechaMatch = (!fechaInicio || fechaPago >= fechaInicio) && (!fechaFin || fechaPago <= fechaFin);
    const proveedorMatch = !filtroProveedor || pago.proveedor.toLowerCase().includes(filtroProveedor.toLowerCase());
    const centroCostoMatch = !filtroCentroCosto || pago.centroCostoId === filtroCentroCosto;
    const statusMatch = pago.status !== 'deferred'; // Excluir pagos diferidos
    
    return fechaMatch && proveedorMatch && centroCostoMatch && statusMatch;
  });
  
  // Lógica de paginación
  const totalItems = pagosFiltrados.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pagosPaginados = pagosFiltrados.slice(startIndex, endIndex);
  
  // Calcular totales
  const totalPagos = pagosFiltrados.reduce((sum, pago) => sum + pago.monto, 0);
  
  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Reset pagination when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };
  
  // Función para exportar CSV
  const handleExportCSV = () => {
    const dataToExport = pagosFiltrados.map(pago => ({
      Fecha: new Date(pago.fecha).toLocaleDateString('es-ES'),
      Proveedor: pago.proveedor,
      Concepto: pago.concepto,
      Monto: pago.monto,
      'Centro de Costo': centrosCosto.find(centro => centro.id === pago.centroCostoId)?.nombre || '',
      'Método de Pago': pago.metodoPago,
      Referencia: pago.referencia || '',
      Comentarios: pago.comentarios || ''
    }));
    
    exportToCSV(dataToExport, `pagos_${new Date().toISOString().split('T')[0]}.csv`);
  };
  
  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: configData?.moneda || 'EUR'
    }).format(amount);
  };

  // Traducir estado del pago
  const translateStatus = (status?: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'approved': 'Aprobado',
      'deferred': 'Diferido',
      'rejected': 'Rechazado'
    };
    if (!status) return 'Sin estado';
    return statusMap[status] || 'Sin estado';
  };

  // El resto del componente permanece igual...
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
      
      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`p-4 rounded-md ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Mostrar formulario si el usuario es creador o aprobador */}
      {(user.role === 'creator' || user.role === 'approver') && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Registrar Nuevo Pago</h2>
          
          {user.role === 'approver' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                ℹ️ Como aprobador, los pagos que registres serán aprobados automáticamente.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                id="fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor *
              </label>
              <input
                type="text"
                id="proveedor"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del proveedor"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="concepto" className="block text-sm font-medium text-gray-700 mb-1">
                Concepto *
              </label>
              <input
                type="text"
                id="concepto"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del pago"
                required
              />
            </div>

            <div>
              <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
                Monto *
              </label>
              <input
                type="number"
                id="monto"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="centroCosto" className="block text-sm font-medium text-gray-700 mb-1">
                Centro de Costo *
              </label>
              <select
                id="centroCosto"
                value={centroCostoId}
                onChange={(e) => setCentroCostoId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar centro de costo</option>
                {centrosCosto.map((centro) => (
                  <option key={centro.id} value={centro.id}>
                    {centro.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="metodoPago" className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago *
              </label>
              <select
                id="metodoPago"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>

            <div>
              <label htmlFor="referencia" className="block text-sm font-medium text-gray-700 mb-1">
                Referencia
              </label>
              <input
                type="text"
                id="referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Número de referencia, factura, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios
              </label>
              <textarea
                id="comentarios"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Información adicional sobre el pago"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Registrar Pago
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="filtroFechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha desde
            </label>
            <input
              type="date"
              id="filtroFechaInicio"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="filtroFechaFin" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha hasta
            </label>
            <input
              type="date"
              id="filtroFechaFin"
              value={filtroFechaFin}
              onChange={(e) => setFiltroFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="filtroProveedor" className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor
            </label>
            <input
              type="text"
              id="filtroProveedor"
              value={filtroProveedor}
              onChange={(e) => setFiltroProveedor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar por proveedor"
            />
          </div>

          <div>
            <label htmlFor="filtroCentroCosto" className="block text-sm font-medium text-gray-700 mb-1">
              Centro de Costo
            </label>
            <select
              id="filtroCentroCosto"
              value={filtroCentroCosto}
              onChange={(e) => setFiltroCentroCosto(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los centros</option>
              {centrosCosto.map((centro) => (
                <option key={centro.id} value={centro.id}>
                  {centro.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen y acciones */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Lista de Pagos</h2>
            <p className="text-sm text-gray-600">
              {totalItems} pago(s) encontrado(s) • Total: {formatCurrency(totalPagos)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              📄 Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} registros • Página {currentPage} de {totalPages}
            </p>
            <p className="text-xs text-gray-500">
              ℹ️ Los pagos diferidos están ocultos en esta vista
            </p>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Exportar CSV
          </button>
        </div>

        {/* Tabla de pagos */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Centro de Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                {user.role === 'creator' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagosPaginados.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(pago.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pago.proveedor}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {pago.concepto}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(pago.monto)}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {centrosCosto.find(centro => centro.id === pago.centroCostoId)?.nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pago.metodoPago}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pago.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      pago.status === 'approved' ? 'bg-green-100 text-green-800' :
                      pago.status === 'deferred' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {translateStatus(pago.status)}
                    </span>
                  </td>
                  {(user.role === 'creator' || user.role === 'approver') && pago.status === 'pending' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(pago.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                  {(user.role === 'creator' || user.role === 'approver') && pago.status !== 'pending' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400">
                      -
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalItems === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron pagos con los filtros aplicados.
            </div>
          )}
        </div>
        
        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Anterior
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  // Mostrar siempre la primera página, última página, página actual y páginas adyacentes
                  const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  const showEllipsis = (page === 2 && currentPage > 4) || (page === totalPages - 1 && currentPage < totalPages - 3);
                  
                  if (showEllipsis) {
                    return (
                      <span key={page} className="px-3 py-2 text-sm text-gray-500">
                        ...
                      </span>
                    );
                  }
                  
                  if (!showPage) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente →
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Registros por página: {itemsPerPage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagos;

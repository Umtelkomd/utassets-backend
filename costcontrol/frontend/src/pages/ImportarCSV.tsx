import React, { useState, useEffect } from 'react';
import { useData } from '../lib/DataContext';
import Papa from 'papaparse';

interface CSVRow {
  [key: string]: string;
}

interface ResultadoImportacion {
  total: number;
  procesados: number;
  errores: number;
  asignacionAutomatica: number;
  asignacionManual: number;
  detalles: Array<{
    fila: CSVRow;
    estado: 'Éxito' | 'Error';
    mensaje: string;
  }>;
}

interface ReglaMappeo {
  palabraClave: string;
  centroCostoId: string;
}

const ImportarCSV: React.FC = () => {
  const { 
    addPago, 
    addCuentaPorPagar, 
    getCentrosCosto,
    isLoading 
  } = useData();
  
  // Estados para datos
  const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [tipoImportacion, setTipoImportacion] = useState<string>('pagos');
  const [resultados, setResultados] = useState<ResultadoImportacion>({
    total: 0,
    procesados: 0,
    errores: 0,
    asignacionAutomatica: 0,
    asignacionManual: 0,
    detalles: []
  });
  const [mostrarResultados, setMostrarResultados] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);
  const [reglasMappeo, setReglasMappeo] = useState<ReglaMappeo[]>([]);
  const [nuevaRegla, setNuevaRegla] = useState<ReglaMappeo>({
    palabraClave: '',
    centroCostoId: ''
  });
  
  // Cargar centros de costo
  useEffect(() => {
    const loadCentrosCosto = async () => {
      try {
        const centrosData = await getCentrosCosto();
        setCentrosCosto(centrosData);
        
        // Cargar reglas de mapeo desde localStorage
        const reglasGuardadas = localStorage.getItem('reglasMappeoCSV');
        if (reglasGuardadas) {
          setReglasMappeo(JSON.parse(reglasGuardadas));
        } else {
          // Reglas predeterminadas basadas en los centros de costo
          const reglasPredeterminadas: ReglaMappeo[] = [
            { palabraClave: 'capacitación', centroCostoId: centrosData.find(c => c.nombre === 'Capacitación')?.id || '' },
            { palabraClave: 'formación', centroCostoId: centrosData.find(c => c.nombre === 'Capacitación')?.id || '' },
            { palabraClave: 'maquinaria', centroCostoId: centrosData.find(c => c.nombre === 'Maquinaria y Equipos')?.id || '' },
            { palabraClave: 'equipo', centroCostoId: centrosData.find(c => c.nombre === 'Maquinaria y Equipos')?.id || '' },
            { palabraClave: 'alquiler equipo', centroCostoId: centrosData.find(c => c.nombre === 'Rentas de Equipos')?.id || '' },
            { palabraClave: 'renta equipo', centroCostoId: centrosData.find(c => c.nombre === 'Rentas de Equipos')?.id || '' },
            { palabraClave: 'oficina', centroCostoId: centrosData.find(c => c.nombre === 'Material de Oficina')?.id || '' },
            { palabraClave: 'papelería', centroCostoId: centrosData.find(c => c.nombre === 'Material de Oficina')?.id || '' },
            { palabraClave: 'electricidad', centroCostoId: centrosData.find(c => c.nombre === 'Servicios Públicos')?.id || '' },
            { palabraClave: 'agua', centroCostoId: centrosData.find(c => c.nombre === 'Servicios Públicos')?.id || '' },
            { palabraClave: 'internet', centroCostoId: centrosData.find(c => c.nombre === 'Servicios Públicos')?.id || '' },
            { palabraClave: 'combustible', centroCostoId: centrosData.find(c => c.nombre === 'Combustible')?.id || '' },
            { palabraClave: 'gasolina', centroCostoId: centrosData.find(c => c.nombre === 'Combustible')?.id || '' },
            { palabraClave: 'diesel', centroCostoId: centrosData.find(c => c.nombre === 'Combustible')?.id || '' },
            { palabraClave: 'reparación', centroCostoId: centrosData.find(c => c.nombre === 'Reparaciones Vehículos')?.id || '' },
            { palabraClave: 'mantenimiento vehículo', centroCostoId: centrosData.find(c => c.nombre === 'Reparaciones Vehículos')?.id || '' },
            { palabraClave: 'alquiler auto', centroCostoId: centrosData.find(c => c.nombre === 'Alquiler de Autos')?.id || '' },
            { palabraClave: 'renta auto', centroCostoId: centrosData.find(c => c.nombre === 'Alquiler de Autos')?.id || '' },
            { palabraClave: 'seguro', centroCostoId: centrosData.find(c => c.nombre === 'Seguros')?.id || '' },
            { palabraClave: 'póliza', centroCostoId: centrosData.find(c => c.nombre === 'Seguros')?.id || '' },
            { palabraClave: 'vivienda', centroCostoId: centrosData.find(c => c.nombre === 'Vivienda Técnicos')?.id || '' },
            { palabraClave: 'alojamiento', centroCostoId: centrosData.find(c => c.nombre === 'Vivienda Técnicos')?.id || '' },
            { palabraClave: 'hospedaje', centroCostoId: centrosData.find(c => c.nombre === 'Vivienda Técnicos')?.id || '' }
          ];
          
          setReglasMappeo(reglasPredeterminadas);
          localStorage.setItem('reglasMappeoCSV', JSON.stringify(reglasPredeterminadas));
        }
      } catch (err) {
        console.error('Error al cargar centros de costo:', err);
      }
    };
    
    loadCentrosCosto();
  }, [getCentrosCosto]);
  
  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };
  
  // Agregar nueva regla de mapeo
  const agregarRegla = () => {
    if (nuevaRegla.palabraClave && nuevaRegla.centroCostoId) {
      const reglasActualizadas = [...reglasMappeo, nuevaRegla];
      setReglasMappeo(reglasActualizadas);
      localStorage.setItem('reglasMappeoCSV', JSON.stringify(reglasActualizadas));
      
      // Limpiar formulario
      setNuevaRegla({
        palabraClave: '',
        centroCostoId: ''
      });
    }
  };
  
  // Eliminar regla de mapeo
  const eliminarRegla = (index: number) => {
    const reglasActualizadas = reglasMappeo.filter((_, i) => i !== index);
    setReglasMappeo(reglasActualizadas);
    localStorage.setItem('reglasMappeoCSV', JSON.stringify(reglasActualizadas));
  };
  
  // Determinar centro de costo basado en descripción
  const determinarCentroCosto = (descripcion: string): string => {
    // Convertir a minúsculas para comparación insensible a mayúsculas/minúsculas
    const descripcionLower = descripcion.toLowerCase();
    
    // Buscar coincidencia en reglas de mapeo
    for (const regla of reglasMappeo) {
      if (descripcionLower.includes(regla.palabraClave.toLowerCase())) {
        return regla.centroCostoId;
      }
    }
    
    // Si no hay coincidencia, devolver el primer centro de costo como predeterminado
    return centrosCosto.length > 0 ? centrosCosto[0].id : '';
  };
  
  // Procesar archivo CSV
  const procesarCSV = () => {
    if (!csvFile) {
      alert('Por favor, seleccione un archivo CSV para importar.');
      return;
    }
    
    setProcesando(true);
    setMostrarResultados(false);
    
    const resultadosImportacion: ResultadoImportacion = {
      total: 0,
      procesados: 0,
      errores: 0,
      asignacionAutomatica: 0,
      asignacionManual: 0,
      detalles: []
    };
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data, errors } = results;
        resultadosImportacion.total = data.length;
        resultadosImportacion.errores = errors.length;
        
        // Procesar cada fila
        for (const row of data as CSVRow[]) {
          try {
            // Mapear campos según el tipo de importación
            if (tipoImportacion === 'pagos') {
              // Validar campos requeridos
              if (!row.Fecha || !row.Proveedor || !row.Concepto || !row.Monto) {
                resultadosImportacion.errores++;
                resultadosImportacion.detalles.push({
                  fila: row,
                  estado: 'Error',
                  mensaje: 'Faltan campos requeridos (Fecha, Proveedor, Concepto, Monto)'
                });
                continue;
              }
              
              // Determinar centro de costo
              let centroCostoId = '';
              if (row.CentroCosto) {
                // Buscar por nombre exacto
                const centroCosto = centrosCosto.find(c => 
                  c.nombre.toLowerCase() === row.CentroCosto.toLowerCase()
                );
                if (centroCosto) {
                  centroCostoId = centroCosto.id;
                  resultadosImportacion.asignacionManual++;
                }
              }
              
              // Si no se encontró por nombre, determinar por descripción
              if (!centroCostoId) {
                centroCostoId = determinarCentroCosto(row.Concepto);
                resultadosImportacion.asignacionAutomatica++;
              }
              
              // Convertir fecha a objeto Date
              const fechaParts = row.Fecha.split('/');
              const fecha = new Date(
                parseInt(fechaParts[2]), // año
                parseInt(fechaParts[1]) - 1, // mes (0-11)
                parseInt(fechaParts[0]) // día
              );
              
              // Crear objeto de pago
              const pago = {
                fecha: fecha,
                proveedor: row.Proveedor,
                concepto: row.Concepto,
                monto: parseFloat(row.Monto.replace(/[^\d.-]/g, '')), // Eliminar símbolos de moneda
                centroCostoId,
                metodoPago: row.MetodoPago || 'Transferencia Bancaria',
                referencia: row.Referencia || '',
                comentarios: row.Comentarios || ''
              };
              
              // Agregar pago
              await addPago(pago);
              resultadosImportacion.procesados++;
              resultadosImportacion.detalles.push({
                fila: row,
                estado: 'Éxito',
                mensaje: `Pago registrado correctamente. Centro de costo: ${centrosCosto.find(c => c.id === centroCostoId)?.nombre || 'No asignado'}`
              });
            } else if (tipoImportacion === 'cuentas') {
              // Validar campos requeridos
              if (!row.FechaEmision || !row.FechaVencimiento || !row.Proveedor || !row.Concepto || !row.Monto) {
                resultadosImportacion.errores++;
                resultadosImportacion.detalles.push({
                  fila: row,
                  estado: 'Error',
                  mensaje: 'Faltan campos requeridos (FechaEmision, FechaVencimiento, Proveedor, Concepto, Monto)'
                });
                continue;
              }
              
              // Determinar centro de costo
              let centroCostoId = '';
              if (row.CentroCosto) {
                // Buscar por nombre exacto
                const centroCosto = centrosCosto.find(c => 
                  c.nombre.toLowerCase() === row.CentroCosto.toLowerCase()
                );
                if (centroCosto) {
                  centroCostoId = centroCosto.id;
                  resultadosImportacion.asignacionManual++;
                }
              }
              
              // Si no se encontró por nombre, determinar por descripción
              if (!centroCostoId) {
                centroCostoId = determinarCentroCosto(row.Concepto);
                resultadosImportacion.asignacionAutomatica++;
              }
              
              // Convertir fechas a objetos Date
              const fechaEmisionParts = row.FechaEmision.split('/');
              const fechaEmision = new Date(
                parseInt(fechaEmisionParts[2]), // año
                parseInt(fechaEmisionParts[1]) - 1, // mes (0-11)
                parseInt(fechaEmisionParts[0]) // día
              );
              
              const fechaVencimientoParts = row.FechaVencimiento.split('/');
              const fechaVencimiento = new Date(
                parseInt(fechaVencimientoParts[2]), // año
                parseInt(fechaVencimientoParts[1]) - 1, // mes (0-11)
                parseInt(fechaVencimientoParts[0]) // día
              );
              
              // Crear objeto de cuenta por pagar
              const estadoValue = row.Estado?.toLowerCase() || 'pendiente';
              // Asegurar que el estado sea uno de los valores permitidos
              const estadoValidado = (estadoValue === 'pendiente' || estadoValue === 'pagada' || estadoValue === 'vencida') 
                ? estadoValue as 'pendiente' | 'pagada' | 'vencida' 
                : 'pendiente';
                
              const cuenta = {
                fecha: fechaEmision,
                fechaVencimiento: fechaVencimiento,
                proveedor: row.Proveedor,
                concepto: row.Concepto,
                monto: parseFloat(row.Monto.replace(/[^\d.-]/g, '')), // Eliminar símbolos de moneda
                centroCostoId,
                estado: estadoValidado,
                comentarios: row.Comentarios || ''
              };
              
              // Agregar cuenta por pagar
              await addCuentaPorPagar(cuenta);
              resultadosImportacion.procesados++;
              resultadosImportacion.detalles.push({
                fila: row,
                estado: 'Éxito',
                mensaje: `Cuenta por pagar registrada correctamente. Centro de costo: ${centrosCosto.find(c => c.id === centroCostoId)?.nombre || 'No asignado'}`
              });
            }
          } catch (error) {
            resultadosImportacion.errores++;
            resultadosImportacion.detalles.push({
              fila: row,
              estado: 'Error',
              mensaje: `Error al procesar: ${error}`
            });
          }
        }
        
        // Actualizar resultados
        setResultados(resultadosImportacion);
        setMostrarResultados(true);
        setProcesando(false);
      },
      error: (error) => {
        console.error('Error al parsear CSV:', error);
        alert('Error al procesar el archivo CSV. Verifique el formato e intente nuevamente.');
        setProcesando(false);
      }
    });
  };
  
  // Generar plantilla CSV
  const generarPlantillaCSV = () => {
    let headers = [];
    let sampleData = [];
    
    if (tipoImportacion === 'pagos') {
      headers = ['Fecha', 'Proveedor', 'Concepto', 'Monto', 'CentroCosto', 'MetodoPago', 'Referencia', 'Comentarios'];
      sampleData = [
        '01/05/2025', 'Proveedor Ejemplo', 'Compra de equipos de fibra óptica', '1250.50', 'Maquinaria y Equipos', 'Transferencia Bancaria', 'FAC-12345', 'Pago mensual'
      ];
    } else {
      headers = ['FechaEmision', 'FechaVencimiento', 'Proveedor', 'Concepto', 'Monto', 'CentroCosto', 'Estado', 'Comentarios'];
      sampleData = [
        '01/05/2025', '15/05/2025', 'Proveedor Ejemplo', 'Alquiler de oficina', '850.00', 'Servicios Públicos', 'pendiente', 'Factura mensual'
      ];
    }
    
    // Crear contenido CSV
    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `plantilla_${tipoImportacion}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando datos...</div>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 border-b pb-2">Importar Datos desde CSV</h1>
      
      {/* Selección de tipo de importación */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Tipo de Importación</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccione el tipo de datos a importar
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="tipoImportacion"
                  value="pagos"
                  checked={tipoImportacion === 'pagos'}
                  onChange={() => setTipoImportacion('pagos')}
                />
                <span className="ml-2">Pagos Realizados</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="tipoImportacion"
                  value="cuentas"
                  checked={tipoImportacion === 'cuentas'}
                  onChange={() => setTipoImportacion('cuentas')}
                />
                <span className="ml-2">Cuentas por Pagar</span>
              </label>
            </div>
          </div>
          
          <div>
            <button
              onClick={generarPlantillaCSV}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Descargar plantilla CSV
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Descargue esta plantilla y úsela como guía para preparar su archivo CSV.
            </p>
          </div>
        </div>
      </div>
      
      {/* Importación de archivo */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Importar Archivo</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccione archivo CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              El archivo debe estar en formato CSV con encabezados.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={procesarCSV}
              disabled={!csvFile || procesando}
              className={`py-2 px-4 rounded ${
                !csvFile || procesando
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
              }`}
            >
              {procesando ? 'Procesando...' : 'Importar Datos'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Reglas de asignación automática */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Reglas de Asignación Automática</h2>
        <p className="text-sm text-gray-600 mb-4">
          Estas reglas se utilizan para asignar automáticamente un centro de costo basado en palabras clave 
          encontradas en la descripción del pago o cuenta por pagar.
        </p>
        
        {/* Formulario para agregar regla */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Palabra Clave
            </label>
            <input
              type="text"
              value={nuevaRegla.palabraClave}
              onChange={(e) => setNuevaRegla({...nuevaRegla, palabraClave: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: combustible, oficina, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Centro de Costo
            </label>
            <select
              value={nuevaRegla.centroCostoId}
              onChange={(e) => setNuevaRegla({...nuevaRegla, centroCostoId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar...</option>
              {centrosCosto.map((centro) => (
                <option key={centro.id} value={centro.id}>
                  {centro.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={agregarRegla}
              disabled={!nuevaRegla.palabraClave || !nuevaRegla.centroCostoId}
              className={`py-2 px-4 rounded ${
                !nuevaRegla.palabraClave || !nuevaRegla.centroCostoId
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 transition-colors'
              }`}
            >
              Agregar Regla
            </button>
          </div>
        </div>
        
        {/* Tabla de reglas */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Palabra Clave</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centro de Costo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reglasMappeo.map((regla, index) => {
                const centroCosto = centrosCosto.find(c => c.id === regla.centroCostoId);
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {regla.palabraClave}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {centroCosto?.nombre || 'No encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => eliminarRegla(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {reglasMappeo.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay reglas definidas. Agregue reglas para mejorar la asignación automática.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Resultados de importación */}
      {mostrarResultados && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Resultados de la Importación</h2>
          
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-800 font-semibold">Total de registros</p>
              <p className="text-2xl font-bold text-blue-600">{resultados.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-green-800 font-semibold">Procesados correctamente</p>
              <p className="text-2xl font-bold text-green-600">{resultados.procesados}</p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-red-800 font-semibold">Errores</p>
              <p className="text-2xl font-bold text-red-600">{resultados.errores}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-yellow-800 font-semibold">Asignación automática de centro de costo</p>
              <p className="text-2xl font-bold text-yellow-600">{resultados.asignacionAutomatica}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-purple-800 font-semibold">Asignación manual de centro de costo</p>
              <p className="text-2xl font-bold text-purple-600">{resultados.asignacionManual}</p>
            </div>
          </div>
          
          {/* Detalles */}
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Detalles de la importación</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resultados.detalles.map((detalle, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        detalle.estado === 'Éxito' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {detalle.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {detalle.mensaje}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <details>
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Ver datos</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(detalle.fila, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Instrucciones */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Instrucciones de Uso</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Seleccione el tipo de datos que desea importar (Pagos o Cuentas por Pagar).</li>
          <li>Descargue la plantilla CSV para ver el formato requerido.</li>
          <li>Prepare su archivo CSV siguiendo el formato de la plantilla.</li>
          <li>Suba el archivo CSV utilizando el selector de archivos.</li>
          <li>Haga clic en "Importar Datos" para procesar el archivo.</li>
          <li>Revise los resultados de la importación para verificar que todo se procesó correctamente.</li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Nota sobre la asignación de centros de costo:</strong> El sistema intentará asignar automáticamente 
            un centro de costo basado en palabras clave encontradas en la descripción. Si el archivo CSV incluye una 
            columna "CentroCosto" con el nombre exacto del centro, se utilizará esa asignación. De lo contrario, 
            se aplicarán las reglas de asignación automática.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportarCSV;

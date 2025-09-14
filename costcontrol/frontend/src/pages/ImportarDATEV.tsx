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
  duplicadosDetectados: number;
  duplicadosImportados: number;
  detalles: Array<{
    fila: CSVRow;
    estado: 'Pendiente' | 'Éxito' | 'Error' | 'Duplicado';
    mensaje: string;
    seleccionado: boolean;
    centroCostoAsignado?: string;
    esDuplicado?: boolean;
  }>;
}

interface ReglaMappeo {
  palabraClave: string;
  centroCostoId: string;
}

const ImportarDATEV: React.FC = () => {
  const { 
    addPago, 
    getPagos,
    getCentrosCosto,
    isLoading 
  } = useData();
  
  // Estados para datos
  const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [pagosExistentes, setPagosExistentes] = useState<any[]>([]);
  const [resultados, setResultados] = useState<ResultadoImportacion>({
    total: 0,
    procesados: 0,
    errores: 0,
    asignacionAutomatica: 0,
    asignacionManual: 0,
    duplicadosDetectados: 0,
    duplicadosImportados: 0,
    detalles: []
  });
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);
  const [importando, setImportando] = useState<boolean>(false);
  const [reglasMappeo, setReglasMappeo] = useState<ReglaMappeo[]>([]);
  const [nuevaRegla, setNuevaRegla] = useState<ReglaMappeo>({
    palabraClave: '',
    centroCostoId: ''
  });
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [seleccionarTodos, setSeleccionarTodos] = useState<boolean>(true);
  
  // Cargar centros de costo y pagos existentes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const centrosData = await getCentrosCosto();
        setCentrosCosto(centrosData);
        
        const pagosData = await getPagos();
        setPagosExistentes(pagosData);
        
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
            { palabraClave: 'hospedaje', centroCostoId: centrosData.find(c => c.nombre === 'Vivienda Técnicos')?.id || '' },
            // Palabras clave específicas para DATEV en alemán
            { palabraClave: 'UNION TANK', centroCostoId: centrosData.find(c => c.nombre === 'Combustible')?.id || '' },
            { palabraClave: 'Telefonica', centroCostoId: centrosData.find(c => c.nombre === 'Servicios Públicos')?.id || '' },
            { palabraClave: 'AOK', centroCostoId: centrosData.find(c => c.nombre === 'Seguros')?.id || '' },
            { palabraClave: 'Versicherung', centroCostoId: centrosData.find(c => c.nombre === 'Seguros')?.id || '' },
            { palabraClave: 'Kraftfahrzeug', centroCostoId: centrosData.find(c => c.nombre === 'Reparaciones Vehículos')?.id || '' },
            { palabraClave: 'Monteurwohnungen', centroCostoId: centrosData.find(c => c.nombre === 'Vivienda Técnicos')?.id || '' },
            { palabraClave: 'Autovermietung', centroCostoId: centrosData.find(c => c.nombre === 'Alquiler de Autos')?.id || '' },
            { palabraClave: 'Sixt', centroCostoId: centrosData.find(c => c.nombre === 'Alquiler de Autos')?.id || '' },
            { palabraClave: 'OBI', centroCostoId: centrosData.find(c => c.nombre === 'Material de Oficina')?.id || '' },
            { palabraClave: 'AMAZON', centroCostoId: centrosData.find(c => c.nombre === 'Material de Oficina')?.id || '' },
          ];
          
          setReglasMappeo(reglasPredeterminadas);
          localStorage.setItem('reglasMappeoCSV', JSON.stringify(reglasPredeterminadas));
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    
    cargarDatos();
  }, [getCentrosCosto, getPagos]);
  
  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
      setMostrarVistaPrevia(false);
      setResultados({
        total: 0,
        procesados: 0,
        errores: 0,
        asignacionAutomatica: 0,
        asignacionManual: 0,
        duplicadosDetectados: 0,
        duplicadosImportados: 0,
        detalles: []
      });
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
  
  // Verificar si un pago es potencialmente duplicado
  const esPotencialDuplicado = (fecha: Date, monto: number, proveedor: string): boolean => {
    return pagosExistentes.some(pago => {
      // Comparar fecha (solo día, mes y año)
      const fechaPago = new Date(pago.fecha);
      const sonMismaFecha = 
        fechaPago.getDate() === fecha.getDate() &&
        fechaPago.getMonth() === fecha.getMonth() &&
        fechaPago.getFullYear() === fecha.getFullYear();
      
      // Comparar monto (con un pequeño margen de error para decimales)
      const esMismoMonto = Math.abs(pago.monto - monto) < 0.01;
      
      // Comparar proveedor (si existe)
      const esMismoProveedor = proveedor && pago.proveedor.toLowerCase().includes(proveedor.toLowerCase());
      
      return sonMismaFecha && esMismoMonto && esMismoProveedor;
    });
  };
  
  // Procesar archivo CSV para vista previa
  const procesarVistaPrevia = () => {
    if (!csvFile) {
      alert('Por favor, seleccione un archivo CSV para importar.');
      return;
    }
    
    setProcesando(true);
    setMostrarVistaPrevia(false);
    
    const resultadosImportacion: ResultadoImportacion = {
      total: 0,
      procesados: 0,
      errores: 0,
      asignacionAutomatica: 0,
      asignacionManual: 0,
      duplicadosDetectados: 0,
      duplicadosImportados: 0,
      detalles: []
    };
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, errors } = results;
        resultadosImportacion.total = data.length;
        resultadosImportacion.errores = errors.length;
        
        // Procesar cada fila para vista previa
        for (const row of data as CSVRow[]) {
          try {
            // Validar que sea una transacción válida (debe tener fecha, monto y alguna descripción)
            if (!row['Buchungsdatum'] || !row['Betrag in EUR'] || (!row['Empfängername/Auftraggeber'] && !row['Verwendungszweck'])) {
              resultadosImportacion.errores++;
              resultadosImportacion.detalles.push({
                fila: row,
                estado: 'Error',
                mensaje: 'Faltan campos requeridos (fecha, monto o descripción)',
                seleccionado: false
              });
              continue;
            }
            
            // Convertir fecha a objeto Date
            const fechaParts = row['Buchungsdatum'].split('.');
            const fecha = new Date(
              parseInt(fechaParts[2]), // año
              parseInt(fechaParts[1]) - 1, // mes (0-11)
              parseInt(fechaParts[0]) // día
            );
            
            // Procesar monto (convertir de formato alemán a número)
            const montoStr = row['Betrag in EUR'].replace('.', '').replace(',', '.');
            const monto = parseFloat(montoStr);
            
            // Determinar proveedor/beneficiario
            const proveedor = row['Empfängername/Auftraggeber'] || 'No especificado';
            
            // Determinar concepto/descripción
            const concepto = row['Verwendungszweck'] || proveedor;
            
            // Determinar centro de costo basado en descripción y proveedor
            const descripcionCompleta = `${proveedor} ${concepto}`;
            const centroCostoId = determinarCentroCosto(descripcionCompleta);
            
            // Verificar si es un potencial duplicado
            const duplicado = esPotencialDuplicado(fecha, monto, proveedor);
            if (duplicado) {
              resultadosImportacion.duplicadosDetectados++;
            }
            
            // Agregar a resultados de vista previa
            resultadosImportacion.detalles.push({
              fila: row,
              estado: 'Pendiente',
              mensaje: `Listo para importar. Centro de costo: ${centrosCosto.find(c => c.id === centroCostoId)?.nombre || 'No asignado'}`,
              seleccionado: !duplicado, // No seleccionar duplicados por defecto
              centroCostoAsignado: centroCostoId,
              esDuplicado: duplicado
            });
          } catch (error) {
            resultadosImportacion.errores++;
            resultadosImportacion.detalles.push({
              fila: row,
              estado: 'Error',
              mensaje: `Error al procesar: ${error}`,
              seleccionado: false
            });
          }
        }
        
        // Actualizar resultados
        setResultados(resultadosImportacion);
        setMostrarVistaPrevia(true);
        setProcesando(false);
      },
      error: (error) => {
        console.error('Error al parsear CSV:', error);
        alert('Error al procesar el archivo CSV. Verifique el formato e intente nuevamente.');
        setProcesando(false);
      }
    });
  };
  
  // Importar registros seleccionados
  const importarSeleccionados = async () => {
    const registrosSeleccionados = resultados.detalles.filter(detalle => 
      detalle.seleccionado && detalle.estado === 'Pendiente'
    );
    
    if (registrosSeleccionados.length === 0) {
      alert('No hay registros seleccionados para importar.');
      return;
    }
    
    setImportando(true);
    
    let procesados = 0;
    let errores = 0;
    let duplicadosImportados = 0;
    
    // Crear copia de los detalles para actualizar
    const detallesActualizados = [...resultados.detalles];
    
    for (let i = 0; i < detallesActualizados.length; i++) {
      const detalle = detallesActualizados[i];
      
      if (detalle.seleccionado && detalle.estado === 'Pendiente') {
        try {
          const row = detalle.fila;
          
          // Convertir fecha a objeto Date
          const fechaParts = row['Buchungsdatum'].split('.');
          const fecha = new Date(
            parseInt(fechaParts[2]), // año
            parseInt(fechaParts[1]) - 1, // mes (0-11)
            parseInt(fechaParts[0]) // día
          );
          
          // Procesar monto (convertir de formato alemán a número)
          const montoStr = row['Betrag in EUR'].replace('.', '').replace(',', '.');
          const monto = parseFloat(montoStr);
          
          // Determinar proveedor/beneficiario
          const proveedor = row['Empfängername/Auftraggeber'] || 'No especificado';
          
          // Determinar concepto/descripción
          const concepto = row['Verwendungszweck'] || proveedor;
          
          // Crear objeto de pago
          const pago = {
            fecha: fecha,
            proveedor: proveedor,
            concepto: concepto,
            monto: monto,
            centroCostoId: detalle.centroCostoAsignado || '',
            metodoPago: 'Transferencia Bancaria',
            referencia: row['IBAN/Kontonummer'] || '',
            comentarios: `Importado de DATEV el ${new Date().toLocaleDateString()}`
          };
          
          // Agregar pago
          await addPago(pago);
          procesados++;
          
          // Actualizar estado en detalles
          detallesActualizados[i] = {
            ...detalle,
            estado: 'Éxito',
            mensaje: `Importado correctamente. Centro de costo: ${centrosCosto.find(c => c.id === detalle.centroCostoAsignado)?.nombre || 'No asignado'}`
          };
          
          // Contar duplicados importados
          if (detalle.esDuplicado) {
            duplicadosImportados++;
          }
        } catch (error) {
          errores++;
          
          // Actualizar estado en detalles
          detallesActualizados[i] = {
            ...detalle,
            estado: 'Error',
            mensaje: `Error al importar: ${error}`
          };
        }
      }
    }
    
    // Actualizar resultados
    setResultados({
      ...resultados,
      procesados: resultados.procesados + procesados,
      errores: resultados.errores + errores,
      duplicadosImportados: resultados.duplicadosImportados + duplicadosImportados,
      detalles: detallesActualizados
    });
    
    setImportando(false);
    
    // Recargar pagos existentes para futuras comprobaciones de duplicados
    const pagosActualizados = await getPagos();
    setPagosExistentes(pagosActualizados);
  };
  
  // Cambiar selección de un registro
  const cambiarSeleccion = (index: number) => {
    const detallesActualizados = [...resultados.detalles];
    detallesActualizados[index].seleccionado = !detallesActualizados[index].seleccionado;
    setResultados({
      ...resultados,
      detalles: detallesActualizados
    });
  };
  
  // Cambiar centro de costo asignado
  const cambiarCentroCosto = (index: number, centroCostoId: string) => {
    const detallesActualizados = [...resultados.detalles];
    detallesActualizados[index].centroCostoAsignado = centroCostoId;
    detallesActualizados[index].mensaje = `Listo para importar. Centro de costo: ${centrosCosto.find(c => c.id === centroCostoId)?.nombre || 'No asignado'}`;
    setResultados({
      ...resultados,
      detalles: detallesActualizados
    });
  };
  
  // Seleccionar/deseleccionar todos los registros
  const toggleSeleccionarTodos = () => {
    const nuevoEstado = !seleccionarTodos;
    setSeleccionarTodos(nuevoEstado);
    
    const detallesActualizados = resultados.detalles.map(detalle => {
      // Solo actualizar los que coinciden con el filtro actual
      if (filtroEstado === 'todos' || 
          (filtroEstado === 'pendientes' && detalle.estado === 'Pendiente') ||
          (filtroEstado === 'duplicados' && detalle.esDuplicado)) {
        return {
          ...detalle,
          seleccionado: nuevoEstado
        };
      }
      return detalle;
    });
    
    setResultados({
      ...resultados,
      detalles: detallesActualizados
    });
  };
  
  // Filtrar registros según estado
  const registrosFiltrados = () => {
    if (filtroEstado === 'todos') {
      return resultados.detalles;
    } else if (filtroEstado === 'pendientes') {
      return resultados.detalles.filter(d => d.estado === 'Pendiente');
    } else if (filtroEstado === 'duplicados') {
      return resultados.detalles.filter(d => d.esDuplicado);
    } else if (filtroEstado === 'exitosos') {
      return resultados.detalles.filter(d => d.estado === 'Éxito');
    } else if (filtroEstado === 'errores') {
      return resultados.detalles.filter(d => d.estado === 'Error');
    }
    return resultados.detalles;
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando datos...</div>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 border-b pb-2">Importar Datos desde DATEV</h1>
      
      {/* Selección de archivo */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Selección de Archivo</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccione el archivo CSV exportado desde DATEV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={procesarVistaPrevia}
              disabled={!csvFile || procesando}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {procesando ? 'Procesando...' : 'Generar Vista Previa'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Vista previa de importación */}
      {mostrarVistaPrevia && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Vista Previa de Importación</h2>
          
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Total de registros</p>
              <p className="text-2xl font-bold text-blue-800">{resultados.total}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Duplicados detectados</p>
              <p className="text-2xl font-bold text-yellow-600">{resultados.duplicadosDetectados}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Errores</p>
              <p className="text-2xl font-bold text-red-600">{resultados.errores}</p>
            </div>
          </div>
          
          {/* Filtros y acciones */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filtrar:</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="todos">Todos</option>
                <option value="pendientes">Pendientes</option>
                <option value="duplicados">Duplicados</option>
                <option value="exitosos">Importados</option>
                <option value="errores">Con errores</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={toggleSeleccionarTodos}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                {seleccionarTodos ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
              </button>
              
              <button
                onClick={importarSeleccionados}
                disabled={importando || resultados.detalles.filter(d => d.seleccionado && d.estado === 'Pendiente').length === 0}
                className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {importando ? 'Importando...' : 'Importar Seleccionados'}
              </button>
            </div>
          </div>
          
          {/* Tabla de registros */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={seleccionarTodos}
                      onChange={toggleSeleccionarTodos}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concepto
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Centro de Costo
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrosFiltrados().map((detalle, index) => {
                  // Extraer datos relevantes
                  const row = detalle.fila;
                  const fecha = row['Buchungsdatum'];
                  const proveedor = row['Empfängername/Auftraggeber'] || 'No especificado';
                  const concepto = row['Verwendungszweck'] || proveedor;
                  const montoStr = row['Betrag in EUR'];
                  
                  return (
                    <tr key={index} className={detalle.esDuplicado ? 'bg-yellow-50' : ''}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={detalle.seleccionado}
                          onChange={() => cambiarSeleccion(resultados.detalles.indexOf(detalle))}
                          disabled={detalle.estado === 'Éxito'}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {fecha}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {proveedor.length > 20 ? `${proveedor.substring(0, 20)}...` : proveedor}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={concepto}>
                          {concepto.length > 30 ? `${concepto.substring(0, 30)}...` : concepto}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {montoStr}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {detalle.estado === 'Pendiente' ? (
                          <select
                            value={detalle.centroCostoAsignado || ''}
                            onChange={(e) => cambiarCentroCosto(resultados.detalles.indexOf(detalle), e.target.value)}
                            className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          >
                            {centrosCosto.map(centro => (
                              <option key={centro.id} value={centro.id}>
                                {centro.nombre}
                              </option>
                            ))}
                          </select>
                        ) : (
                          centrosCosto.find(c => c.id === detalle.centroCostoAsignado)?.nombre || 'No asignado'
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${detalle.estado === 'Éxito' ? 'bg-green-100 text-green-800' : 
                            detalle.estado === 'Error' ? 'bg-red-100 text-red-800' : 
                              detalle.esDuplicado ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {detalle.esDuplicado && detalle.estado === 'Pendiente' ? 'Posible duplicado' : detalle.estado}
                        </span>
                        {detalle.mensaje && (
                          <div className="text-xs text-gray-500 mt-1">
                            {detalle.mensaje}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Botón de importación final */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={importarSeleccionados}
              disabled={importando || resultados.detalles.filter(d => d.seleccionado && d.estado === 'Pendiente').length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {importando ? 'Importando...' : 'Importar Seleccionados'}
            </button>
          </div>
        </div>
      )}
      
      {/* Reglas de mapeo */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Reglas de Asignación Automática</h2>
        
        {/* Formulario para agregar regla */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Palabra clave
            </label>
            <input
              type="text"
              value={nuevaRegla.palabraClave}
              onChange={(e) => setNuevaRegla({...nuevaRegla, palabraClave: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Ej: combustible"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Centro de costo
            </label>
            <select
              value={nuevaRegla.centroCostoId}
              onChange={(e) => setNuevaRegla({...nuevaRegla, centroCostoId: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="">Seleccione un centro de costo</option>
              {centrosCosto.map(centro => (
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Agregar Regla
            </button>
          </div>
        </div>
        
        {/* Lista de reglas */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Palabra clave
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Centro de costo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reglasMappeo.map((regla, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {regla.palabraClave}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {centrosCosto.find(c => c.id === regla.centroCostoId)?.nombre || 'No encontrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => eliminarRegla(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ImportarDATEV;

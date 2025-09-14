import React, { useState, useEffect } from 'react';
import { useData } from '../lib/DataContext';

const CentrosCosto: React.FC = () => {
  const { 
    getCentrosCosto, 
    addCentroCosto, 
    updateCentroCosto,
    deleteCentroCosto, 
    exportToCSV,
    isLoading
  } = useData();
  
  // Estados para el formulario
  const [nombre, setNombre] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estado para la tabla
  const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
  
  // Estado para mensajes
  const [mensaje, setMensaje] = useState<{tipo: 'success' | 'error', texto: string} | null>(null);
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCentrosCosto();
        setCentrosCosto(data);
      } catch (err) {
        console.error('Error al cargar centros de costo:', err);
        setMensaje({
          tipo: 'error',
          texto: 'Error al cargar los centros de costo. Por favor, recarga la página.'
        });
      }
    };
    
    loadData();
  }, [getCentrosCosto]);
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!nombre) {
      setMensaje({
        tipo: 'error',
        texto: 'El nombre del centro de costo es obligatorio.'
      });
      return;
    }
    
    try {
      if (editingId) {
        // Actualizar centro de costo existente
        await updateCentroCosto(editingId, {
          nombre,
          descripcion: descripcion || undefined
        });
        
        setMensaje({
          tipo: 'success',
          texto: 'Centro de costo actualizado correctamente.'
        });
      } else {
        // Crear nuevo centro de costo
        await addCentroCosto({
          nombre,
          descripcion: descripcion || undefined
        });
        
        setMensaje({
          tipo: 'success',
          texto: 'Centro de costo creado correctamente.'
        });
      }
      
      // Actualizar lista de centros de costo
      const updatedCentros = await getCentrosCosto();
      setCentrosCosto(updatedCentros);
      
      // Limpiar formulario
      setNombre('');
      setDescripcion('');
      setEditingId(null);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMensaje(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error al guardar centro de costo:', err);
      setMensaje({
        tipo: 'error',
        texto: 'Error al guardar el centro de costo. Inténtalo de nuevo.'
      });
    }
  };
  
  // Manejar edición de centro de costo
  const handleEdit = (id: string) => {
    const centro = centrosCosto.find(c => c.id === id);
    if (centro) {
      setNombre(centro.nombre);
      setDescripcion(centro.descripcion || '');
      setEditingId(id);
    }
  };
  
  // Manejar eliminación de centro de costo
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este centro de costo? Esta acción no se puede deshacer.')) {
      try {
        await deleteCentroCosto(id);
        
        // Actualizar lista de centros de costo
        const updatedCentros = await getCentrosCosto();
        setCentrosCosto(updatedCentros);
        
        setMensaje({
          tipo: 'success',
          texto: 'Centro de costo eliminado correctamente.'
        });
        
        setTimeout(() => {
          setMensaje(null);
        }, 3000);
        
      } catch (err) {
        console.error('Error al eliminar centro de costo:', err);
        setMensaje({
          tipo: 'error',
          texto: 'Error al eliminar el centro de costo. Es posible que tenga pagos o cuentas asociadas.'
        });
      }
    }
  };
  
  // Cancelar edición
  const handleCancel = () => {
    setNombre('');
    setDescripcion('');
    setEditingId(null);
  };
  
  // Exportar a CSV
  const handleExportCSV = () => {
    const centrosParaExportar = centrosCosto.map(centro => ({
      'ID': centro.id,
      'Nombre': centro.nombre,
      'Descripción': centro.descripcion || '',
      'Fecha de Creación': new Date(centro.createdAt).toLocaleDateString('de-DE')
    }));
    
    exportToCSV(centrosParaExportar, 'centros_costo');
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando datos...</div>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 border-b pb-2">Centros de Costo</h1>
      
      {/* Mensaje de éxito o error */}
      {mensaje && (
        <div className={`p-4 rounded ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {mensaje.texto}
        </div>
      )}
      
      {/* Formulario de creación/edición */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          {editingId ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Tabla de centros de costo */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-800">Listado de Centros de Costo</h2>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
            disabled={centrosCosto.length === 0}
          >
            Exportar a CSV
          </button>
        </div>
        
        {centrosCosto.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {centrosCosto.map((centro) => (
                  <tr key={centro.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {centro.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {centro.descripcion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(centro.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(centro.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-4">
            No hay centros de costo registrados. Crea uno nuevo utilizando el formulario.
          </p>
        )}
      </div>
    </div>
  );
};

export default CentrosCosto;

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from './axiosConfig';

// Definición de tipos
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface CentroCosto {
  id: string;
  nombre: string;
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pago {
  id: string;
  fecha: Date;
  proveedor: string;
  concepto: string;
  monto: number;
  centroCostoId: string;
  metodoPago: string;
  referencia?: string;
  comentarios?: string;
  // User system fields
  status?: string;
  createdByUserId?: number;
  reviewedByUserId?: number;
  reviewDate?: Date;
  reviewComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CuentaPorPagar {
  id: string;
  fecha: Date;
  fechaVencimiento: Date;
  proveedor: string;
  concepto: string;
  monto: number;
  centroCostoId: string;
  estado: 'pendiente' | 'pagada' | 'vencida';
  comentarios?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Configuracion {
  id: string;
  nombreEmpresa: string;
  moneda: string;
  formatoFecha: string;
  slackBotToken?: string;
  slackChannel?: string;
  slackEnabled?: boolean;
  ultimaActualizacion: Date;
}

// Contexto para los datos
interface DataContextType {
  // Centros de costo
  getCentrosCosto: () => Promise<CentroCosto[]>;
  getCentroCosto: (id: string) => Promise<CentroCosto | undefined>;
  addCentroCosto: (centro: Omit<CentroCosto, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCentroCosto: (id: string, centro: Partial<Omit<CentroCosto, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteCentroCosto: (id: string) => Promise<void>;
  
  // Pagos
  getPagos: (filters?: any) => Promise<Pago[]>;
  getPago: (id: string) => Promise<Pago | undefined>;
  addPago: (pago: Omit<Pago, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePago: (id: string, pago: Partial<Omit<Pago, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deletePago: (id: string) => Promise<void>;
  
  // Cuentas por pagar
  getCuentasPorPagar: () => Promise<CuentaPorPagar[]>;
  getCuentaPorPagar: (id: string) => Promise<CuentaPorPagar | undefined>;
  addCuentaPorPagar: (cuenta: Omit<CuentaPorPagar, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCuentaPorPagar: (id: string, cuenta: Partial<Omit<CuentaPorPagar, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteCuentaPorPagar: (id: string) => Promise<void>;
  
  // Configuración
  getConfiguracion: () => Promise<Configuracion | undefined>;
  updateConfiguracion: (config: Partial<Omit<Configuracion, 'id'>>) => Promise<void>;
  
  // Reportes y métricas
  getReportePagos: (filters?: any) => Promise<any[]>;
  getDashboardMetrics: (filters?: any) => Promise<any>;
  
  // Utilidades
  exportToCSV: (data: any[], filename: string) => void;
  
  // Estado
  isLoading: boolean;
}

// Crear contexto
const DataContext = createContext<DataContextType | undefined>(undefined);

// Proveedor de datos
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Inicializar base de datos
  useEffect(() => {
    const initDB = async () => {
      try {
        // Simplemente marcar como cargado - los centros ya están creados
        setIsLoading(false);
      } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        setIsLoading(false);
      }
    };
    
    initDB();
  }, []);
  
  // Funciones para centros de costo
  const getCentrosCosto = async (): Promise<CentroCosto[]> => {
    const { data } = await apiClient.get('/centros-costo');
    return data;
  };
  
  const getCentroCosto = async (id: string): Promise<CentroCosto | undefined> => {
    const { data } = await apiClient.get(`/centros-costo/${id}`);
    return data;
  };
  
  const addCentroCosto = async (centro: Omit<CentroCosto, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const { data } = await apiClient.post('/centros-costo', centro);
    return data.id;
  };
  
  const updateCentroCosto = async (id: string, centro: Partial<Omit<CentroCosto, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await apiClient.put(`/centros-costo/${id}`, centro);
  };
  
  const deleteCentroCosto = async (id: string): Promise<void> => {
    await apiClient.delete(`/centros-costo/${id}`);
  };
  
  // Funciones para pagos
  const getPagos = async (filters?: any): Promise<Pago[]> => {
    let endpoint = '/pagos';
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value as string);
        }
      });
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
    }
    
    const { data } = await apiClient.get(endpoint);
    return data;
  };
  
  const getPago = async (id: string): Promise<Pago | undefined> => {
    const { data } = await apiClient.get(`/pagos/${id}`);
    return data;
  };
  
  const addPago = async (pago: Omit<Pago, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const { data } = await apiClient.post('/pagos', pago);
    return data.id;
  };
  
  const updatePago = async (id: string, pago: Partial<Omit<Pago, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await apiClient.put(`/pagos/${id}`, pago);
  };
  
  const deletePago = async (id: string): Promise<void> => {
    await apiClient.delete(`/pagos/${id}`);
  };

  // Funciones para reportes
  const getReportePagos = async (filters?: any): Promise<any[]> => {
    let endpoint = '/reportes/pagos';
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value as string);
        }
      });
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
    }
    
    try {
      const { data } = await apiClient.get(endpoint);
      return data;
    } catch (error) {
      console.error('Error al obtener reporte de pagos:', error);
      throw error;
    }
  };

  // Función para métricas del dashboard
  const getDashboardMetrics = async (filters?: any): Promise<any> => {
    let endpoint = '/pagos/metrics';
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value as string);
        }
      });
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
    }
    
    try {
      const { data } = await apiClient.get(endpoint);
      return data;
    } catch (error) {
      console.error('Error al obtener métricas del dashboard:', error);
      throw error;
    }
  };
  
  // Funciones para cuentas por pagar
  const getCuentasPorPagar = async (): Promise<CuentaPorPagar[]> => {
    const { data } = await apiClient.get('/cuentas-por-pagar');
    return data;
  };
  
  const getCuentaPorPagar = async (id: string): Promise<CuentaPorPagar | undefined> => {
    const { data } = await apiClient.get(`/cuentas-por-pagar/${id}`);
    return data;
  };
  
  const addCuentaPorPagar = async (cuenta: Omit<CuentaPorPagar, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const { data } = await apiClient.post('/cuentas-por-pagar', cuenta);
    return data.id;
  };
  
  const updateCuentaPorPagar = async (id: string, cuenta: Partial<Omit<CuentaPorPagar, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await apiClient.put(`/cuentas-por-pagar/${id}`, cuenta);
  };
  
  const deleteCuentaPorPagar = async (id: string): Promise<void> => {
    await apiClient.delete(`/cuentas-por-pagar/${id}`);
  };
  
  // Funciones para configuración
  const getConfiguracion = async (): Promise<Configuracion | undefined> => {
    const { data } = await apiClient.get('/configuracion');
    return data;
  };
  
  const updateConfiguracion = async (config: Partial<Omit<Configuracion, 'id'>>): Promise<void> => {
    await apiClient.put('/configuracion', config);
  };
  
  // Función para exportar a CSV
  const exportToCSV = (data: any[], filename: string): void => {
    if (!data || !data.length) {
      console.warn('No hay datos para exportar');
      return;
    }
    
    // Obtener encabezados
    const headers = Object.keys(data[0]);
    
    // Crear contenido CSV
    const csvContent = [
      headers.join(','), // Encabezados
      ...data.map(row => 
        headers.map(header => {
          const cell = row[header];
          // Escapar comas y comillas
          if (cell === null || cell === undefined) {
            return '';
          }
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const value: DataContextType = {
    // Centros de costo
    getCentrosCosto,
    getCentroCosto,
    addCentroCosto,
    updateCentroCosto,
    deleteCentroCosto,
    
    // Pagos
    getPagos,
    getPago,
    addPago,
    updatePago,
    deletePago,
    
    // Cuentas por pagar
    getCuentasPorPagar,
    getCuentaPorPagar,
    addCuentaPorPagar,
    updateCuentaPorPagar,
    deleteCuentaPorPagar,
    
    // Configuración
    getConfiguracion,
    updateConfiguracion,
    
    // Reportes y métricas
    getReportePagos,
    getDashboardMetrics,
    
    // Utilidades
    exportToCSV,
    
    // Estado
    isLoading
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Hook para usar el contexto
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};

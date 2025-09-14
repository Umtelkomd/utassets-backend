import { useState, useEffect } from 'react';
import { useData } from '../lib/DataContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const Dashboard: React.FC = () => {
  const { 
    getCentrosCosto,
    getConfiguracion,
    getDashboardMetrics,
    isLoading
  } = useData();
  
  const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({});
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Función para obtener fechas según el período seleccionado
  const getPeriodDates = (period: string) => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '365':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Función para cargar métricas
  const loadMetrics = async (period?: string) => {
    setIsRefreshing(true);
    try {
      const dates = getPeriodDates(period || selectedPeriod);
      console.log('Loading metrics with dates:', dates);
      const metricsData = await getDashboardMetrics(dates);
      console.log('Metrics data received:', metricsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [centrosData, configData] = await Promise.all([
          getCentrosCosto(),
          getConfiguracion()
        ]);
        
        setCentrosCosto(centrosData);
        setConfigData(configData);
        
        // Cargar métricas mejoradas
        await loadMetrics();
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    
    loadData();
  }, [getCentrosCosto, getConfiguracion]);

  // Efecto para recargar métricas cuando cambie el período
  useEffect(() => {
    if (selectedPeriod) {
      loadMetrics(selectedPeriod);
    }
  }, [selectedPeriod]);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      loadMetrics();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);
  
  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: configData?.moneda || 'EUR' 
    }).format(amount);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando datos...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-lg shadow-xl overflow-hidden">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
          <div className="relative px-6 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  💼 Dashboard Ejecutivo
                </h1>
                <p className="text-xl text-blue-100 opacity-90">
                  Control de Costos y Gestión Financiera
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-100 text-sm">En tiempo real</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Selector de período mejorado */}
                <div className="backdrop-blur-lg bg-white/20 rounded-xl p-4 border border-white/30">
                  <label className="block text-sm font-medium text-white mb-2">Período de Análisis</label>
                  <select 
                    value={selectedPeriod} 
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  >
                    <option value="7" className="text-gray-800">📅 Últimos 7 días</option>
                    <option value="30" className="text-gray-800">📅 Últimos 30 días</option>
                    <option value="90" className="text-gray-800">📅 Últimos 3 meses</option>
                    <option value="365" className="text-gray-800">📅 Último año</option>
                  </select>
                </div>
                
                {/* Botón de refresh mejorado */}
                <button
                  onClick={() => loadMetrics()}
                  disabled={isRefreshing}
                  className="backdrop-blur-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 group"
                >
                  {isRefreshing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Actualizando datos...
                    </>
                  ) : (
                    <>
                      <span className="text-xl group-hover:rotate-180 transition-transform duration-300">🔄</span>
                      Actualizar Dashboard
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenedor principal con padding */}
        <div className="px-6 py-8 space-y-8">
          
          {/* KPIs Super Visuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Total Pagos */}
            <div className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-blue-700/30 border border-blue-300/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-2xl shadow-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-200 mb-1">TOTAL PAGOS</div>
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(metrics.totalAmount || 0)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-blue-200 text-sm">
                    {metrics.totalPayments || 0} transacciones
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <span>↗</span>
                    <span>+{((metrics.totalAmount || 0) / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagos Aprobados */}
            <div className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-green-700/30 border border-green-300/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-500 rounded-2xl shadow-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-200 mb-1">APROBADOS</div>
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(metrics.approvedAmount || 0)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-green-200 text-sm">
                    {metrics.approvedPayments || 0} aprobados
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <span>✓</span>
                    <span>{((metrics.approvedPayments || 0) / (metrics.totalPayments || 1) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagos Pendientes */}
            <div className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-amber-500/20 to-orange-700/30 border border-amber-300/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-amber-500 rounded-2xl shadow-lg">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-amber-200 mb-1">PENDIENTES</div>
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(metrics.pendingAmount || 0)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-amber-200 text-sm">
                    {metrics.pendingPayments || 0} pendientes
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    <span>⚠</span>
                    <span>Acción requerida</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promedio de Pagos */}
            <div className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-indigo-700/30 border border-purple-300/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-2xl shadow-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-200 mb-1">PROMEDIO</div>
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(metrics.averagePayment || 0)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-purple-200 text-sm">
                    por transacción
                  </div>
                  <div className="flex items-center gap-1 text-purple-400 text-sm">
                    <span>📈</span>
                    <span>Análisis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {/* Gráficas Modernas */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Gráfica de tendencia de pagos */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500 rounded-2xl">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Tendencia de Pagos</h3>
                  <p className="text-blue-200 text-sm">Evolución temporal de los pagos</p>
                </div>
              </div>
              <div className="h-80 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.dailyPayments || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#ffffff' }}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#ffffff' }} 
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(59, 130, 246, 0.5)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                      formatter={(value, name) => [
                        name === 'amount' ? formatCurrency(Number(value)) : value,
                        name === 'amount' ? 'Monto' : 'Cantidad'
                      ]}
                      labelFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3B82F6" 
                      strokeWidth={4}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gráfica de distribución por estado */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-500 rounded-2xl">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Distribución por Estado</h3>
                  <p className="text-blue-200 text-sm">Estados de los pagos procesados</p>
                </div>
              </div>
              <div className="h-80 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Aprobados', value: metrics.statusDistribution?.approved || 0 },
                        { name: 'Pendientes', value: metrics.statusDistribution?.pending || 0 },
                        { name: 'Diferidos', value: metrics.statusDistribution?.deferred || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {[
                        { name: 'Aprobados', value: metrics.statusDistribution?.approved || 0 },
                        { name: 'Pendientes', value: metrics.statusDistribution?.pending || 0 },
                        { name: 'Diferidos', value: metrics.statusDistribution?.deferred || 0 }
                      ].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#EF4444'][index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(59, 130, 246, 0.5)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        
          {/* Top Centros de Costo */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500 rounded-2xl">
                <span className="text-xl">🏢</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Top Centros de Costo</h3>
                <p className="text-blue-200 text-sm">Ranking por volumen de gastos</p>
              </div>
            </div>
            <div className="h-80 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.topCostCenters || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="centroId" 
                    tick={{ fontSize: 12, fill: '#ffffff' }}
                    tickFormatter={(centroId) => {
                      const centro = centrosCosto.find(c => c.id == centroId);
                      return centro?.nombre?.substring(0, 8) + '...' || `C${centroId}`;
                    }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#ffffff' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      borderRadius: '12px',
                      color: 'white'
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Monto Total']}
                    labelFormatter={(centroId) => {
                      const centro = centrosCosto.find(c => c.id == centroId);
                      return centro?.nombre || `Centro ${centroId}`;
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="url(#barGradient)" 
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1E40AF" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
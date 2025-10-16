import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DataProvider, User } from './lib/DataContext';
import { Toaster } from './components/ui/toaster';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pagos from './pages/Pagos';
import CuentasPorPagar from './pages/CuentasPorPagar';
import CentrosCosto from './pages/CentrosCosto';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import ImportarCSV from './pages/ImportarCSV';
import ImportarDATEV from './pages/ImportarDATEV';
import Login from './pages/Login';
import PaymentApproval from './pages/PaymentApproval';
import apiClient from './lib/axiosConfig';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🚀 [App.tsx] Iniciando verificación de autenticación...');
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      console.log('🔍 [App.tsx] Estado localStorage:', {
        hasToken: !!savedToken,
        hasUser: !!savedUser,
        tokenStart: savedToken ? savedToken.substring(0, 20) + '...' : 'none'
      });

      if (savedToken && savedUser) {
        console.log('✅ [App.tsx] Token encontrado, verificando con backend...');
        
        // Verificar que el token siga siendo válido (enviar en cuerpo)
        const response = await apiClient.post('/auth/verify', { token: savedToken });

        console.log('📡 [App.tsx] Respuesta del backend:', response.status);

        if (response.status >= 200 && response.status < 300) {
          const data = response.data;
          console.log('📄 [App.tsx] Data recibida:', {
            hasUser: !!data.user,
            userEmail: data.user?.email,
            userRole: data.user?.role
          });
          
          // ✅ VALIDACIÓN: Solo administradores pueden usar CostControl
          if (data.user && (data.user.role === 'administrador' || data.user.role === 'ADMIN')) {
            console.log('✅ [App.tsx] Usuario autorizado, estableciendo sesión');
            setUser(data.user);
          } else {
            console.log('❌ [App.tsx] Usuario no es administrador, limpiando y redirigiendo');
            // Usuario no es administrador, limpiar datos y redirigir
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            
            console.log('⚠️ Acceso denegado: Solo administradores pueden acceder');
            
            // Redirigir a UTAssets
            window.location.href = 'https://glassfaser-utk.de/utassets';
          }
        } else {
          console.log('❌ [App.tsx] Token inválido, limpiando datos');
          // Token inválido, limpiar datos
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        console.log('📋 [App.tsx] No hay token guardado, mostrando login');
      }
    } catch (error) {
      console.error('❌ [App.tsx] Error al verificar estado de autenticación:', error);
      // En caso de error, limpiar datos por seguridad
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      console.log('🏁 [App.tsx] Finalizando verificación, setLoading(false)');
      setLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    // Limpiar credenciales de CostControl y UTAssets
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // UTAssets
      sessionStorage.removeItem('cc_sso_attempt');
      // Expirar cookie authToken si existiera
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch {}
    setUser(null);

    // Redirigir a UTAssets login con retorno a CostControl
    const viteBase = (import.meta.env.BASE_URL || '/costcontrol/').replace(/\/$/, '');
    const COSTCONTROL_URL = (import.meta.env.VITE_COSTCONTROL_URL || `${window.location.origin}${viteBase}`);
    const UTASSETS_LOGIN_URL = import.meta.env.VITE_UTASSETS_URL || 'https://glassfaser-utk.de/utassets/login';
    const sep = UTASSETS_LOGIN_URL.includes('?') ? '&' : '?';
    window.location.href = `${UTASSETS_LOGIN_URL}${sep}redirect=${encodeURIComponent(COSTCONTROL_URL)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <DataProvider>
      <Router basename="/costcontrol">
        <Routes>
          <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
            <Route index element={<Dashboard />} />
            <Route path="pagos" element={<Pagos user={user} />} />
            <Route path="cuentas-por-pagar" element={<CuentasPorPagar />} />
            <Route path="centros-costo" element={<CentrosCosto />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="importar-csv" element={<ImportarCSV />} />
            <Route path="importar-datev" element={<ImportarDATEV />} />
            <Route path="payment-approval" element={<PaymentApproval />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </DataProvider>
  );
}

export default App;

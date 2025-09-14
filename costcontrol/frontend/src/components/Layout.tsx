import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useData, User } from '../lib/DataContext';
import { Button } from './ui/button';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const { isLoading } = useData();
  
  // Determine active route
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-blue-800 text-white shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold">Sistema de Pagos</h1>
          <p className="text-sm text-blue-200">Gestión Financiera</p>
          <div className="mt-2 p-2 bg-blue-700 rounded">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-blue-200 capitalize">{user.role}</p>
          </div>
        </div>
        
        <nav className="mt-6">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/" 
                className={`block px-4 py-2 hover:bg-blue-700 ${isActive('/') ? 'bg-blue-700 font-bold' : ''}`}
              >
                Tablero
              </Link>
            </li>
            
            {/* Navigation for creator role */}
            {user.role === 'creator' && (
              <li>
                <Link 
                  to="/pagos" 
                  className={`block px-4 py-2 hover:bg-blue-700 ${isActive('/pagos') ? 'bg-blue-700 font-bold' : ''}`}
                >
                  Crear Pagos
                </Link>
              </li>
            )}
            
            {/* Navigation for approver role */}
            {user.role === 'approver' && (
              <>
                <li>
                  <Link 
                    to="/pagos" 
                    className={`block px-4 py-2 hover:bg-blue-700 ${isActive('/pagos') ? 'bg-blue-700 font-bold' : ''}`}
                  >
                    Gestionar Pagos
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/payment-approval" 
                    className={`block px-4 py-2 hover:bg-blue-700 ${isActive('/payment-approval') ? 'bg-blue-700 font-bold' : ''}`}
                  >
                    Aprobar Pagos
                  </Link>
                </li>
              </>
            )}
            
            {/* Common navigation */}
            <li>
              <Link 
                to="/cuentas-por-pagar" 
                className={`block px-4 py-2 hover:bg-blue-700 ${isActive('/cuentas-por-pagar') ? 'bg-blue-700 font-bold' : ''}`}
              >
                Cuentas por Pagar
              </Link>
            </li>
            <li>
              <Link 
                to="/centros-costo" 
                className={`block px-4 py-2 hover:bg-blue-700 ${isActive('/centros-costo') ? 'bg-blue-700 font-bold' : ''}`}
              >
                Centros de Costo
              </Link>
            </li>
            <li>
              <Link 
                to="/reportes" 
                className={`block px-4 py-2 hover:bg-blue-700 ${isActive('/reportes') ? 'bg-blue-700 font-bold' : ''}`}
              >
                Reportes
              </Link>
            </li>
            <li>
              <Link 
                to="/importar-datev" 
                className={`block px-4 py-2 hover:bg-blue-700 ${isActive('/importar-datev') ? 'bg-blue-700 font-bold' : ''}`}
              >
                Importar DATEV
              </Link>
            </li>
            <li>
              <Link 
                to="/importar-csv" 
                className={`block px-4 py-2 hover:bg-blue-700 ${isActive('/importar-csv') ? 'bg-blue-700 font-bold' : ''}`}
              >
                Importar CSV
              </Link>
            </li>
            <li>
              <Link 
                to="/configuracion" 
                className={`block px-4 py-2 hover:bg-blue-700 ${isActive('/configuracion') ? 'bg-blue-700 font-bold' : ''}`}
              >
                Configuración
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Button 
            onClick={onLogout}
            className="w-full mb-2 bg-red-600 hover:bg-red-700"
          >
            Cerrar Sesión
          </Button>
          <div className="text-sm text-blue-300">
            <p>© 2025 Sistema de Pagos</p>
            <p>Versión 1.1.0</p>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="ml-64 p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default Layout;

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import apiClient from '../lib/axiosConfig';
import { User } from '../lib/DataContext';

interface LoginProps {
  onLogin: (user: User) => void;
}

const SSO_GUARD_KEY = 'cc_sso_attempt';

export default function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const UTASSETS_LOGIN_URL = import.meta.env.VITE_UTASSETS_URL || 'https://glassfaser-utk.de/utassets/login';
  const viteBase = (import.meta.env.BASE_URL || '/costcontrol/').replace(/\/$/, '');
  const COSTCONTROL_URL = (import.meta.env.VITE_COSTCONTROL_URL || `${window.location.origin}${viteBase}`);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Preferir token de CostControl, o usar el de UTAssets si existe
      const ccToken = localStorage.getItem('authToken');
      const uaToken = localStorage.getItem('token');
      const anyToken = ccToken || uaToken;

      if (anyToken) {
        const response = await apiClient.post('/auth/verify', { token: anyToken });
        if (response.status >= 200 && response.status < 300 && response.data?.user) {
          const user: User = response.data.user;
          if (user.role === 'administrador' || user.role === 'ADMIN') {
            localStorage.setItem('user', JSON.stringify(user));
            onLogin(user);
            return;
          }
        }
      }

      // Sin sesión válida → redirigir a UTAssets (loop guard)
      redirectToUTAssets();
    } catch (error) {
      redirectToUTAssets();
    } finally {
      setLoading(false);
    }
  };

  const redirectToUTAssets = () => {
    if (sessionStorage.getItem(SSO_GUARD_KEY) === '1') {
      setRedirecting(false);
      return;
    }
    sessionStorage.setItem(SSO_GUARD_KEY, '1');
    setRedirecting(true);
    const sep = UTASSETS_LOGIN_URL.includes('?') ? '&' : '?';
    window.location.href = `${UTASSETS_LOGIN_URL}${sep}redirect=${encodeURIComponent(COSTCONTROL_URL)}`;
  };

  if (loading || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sistema de Control de Costos
            </CardTitle>
            <CardDescription>
              Redirigiendo al sistema de autenticación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 mb-4">Conectando con UTAssets...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sistema de Control de Costos
          </CardTitle>
          <CardDescription>
            Acceso restringido a administradores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600 mb-4">
            <p className="mb-2">
              Para acceder al sistema, debe autenticarse usando UTAssets.
            </p>
          </div>
          <Button 
            onClick={() => {
              sessionStorage.removeItem(SSO_GUARD_KEY);
              const sep = UTASSETS_LOGIN_URL.includes('?') ? '&' : '?';
              window.location.href = `${UTASSETS_LOGIN_URL}${sep}redirect=${encodeURIComponent(COSTCONTROL_URL)}`;
            }}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            Ir a UTAssets
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 
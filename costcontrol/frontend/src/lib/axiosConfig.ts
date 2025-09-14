import axios from 'axios';

// Configurar la URL base del backend
const baseURL = import.meta.env.VITE_BACKEND_URL || 'https://costcontrol-backend.onrender.com';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests - añadir token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    // Usar token de CostControl si existe, si no, usar token de UTAssets
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      // No borrar 'token' de UTAssets automáticamente
      localStorage.removeItem('user');
      
      // Redirigir al login solo si no estamos ya ahí
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/costcontrol';
      }
    } else if (error.response?.status === 503) {
      // Servicio de autenticación no disponible
      console.error('Servicio de autenticación no disponible');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 

import { useState, useEffect } from 'react';
import { useData } from '../lib/DataContext';

export const useDateFormatter = () => {
  const { getConfiguracion } = useData();
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getConfiguracion();
        if (config && config.formatoFecha) {
          setDateFormat(config.formatoFecha);
        }
      } catch (err) {
        console.error('Error al cargar configuración de fecha:', err);
      }
    };

    loadConfig();
  }, [getConfiguracion]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);

    switch (dateFormat) {
      case 'DD/MM/YYYY':
        return d.toLocaleDateString('de-DE');
      case 'MM/DD/YYYY':
        return d.toLocaleDateString('en-US');
      case 'YYYY-MM-DD':
        return d.toISOString().split('T')[0];
      default:
        return d.toLocaleDateString('de-DE');
    }
  };

  return formatDate;
};


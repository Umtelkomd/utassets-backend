import { useState, useEffect } from 'react';
import { useData } from '../lib/DataContext';

export const useCurrencyFormatter = () => {
  const { getConfiguracion } = useData();
  const [currency, setCurrency] = useState('EUR');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getConfiguracion();
        if (config && config.moneda) {
          setCurrency(config.moneda);
        }
      } catch (err) {
        console.error('Error al cargar configuración de moneda:', err);
      }
    };

    loadConfig();
  }, [getConfiguracion]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency
    }).format(amount);
  };

  return formatCurrency;
};


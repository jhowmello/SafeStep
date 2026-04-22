import { useState, useEffect, useCallback } from 'react';
import { OrdemServico } from '../types';
import api from '../services/api';

export function useOrdensServico(tecnicoId?: number) {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrdens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = tecnicoId ? { tecnicoId } : {};
      const response = await api.get('/ordensServico', { params });
      setOrdens(response.data);
    } catch {
      setError('Erro ao carregar ordens de serviço. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  }, [tecnicoId]);

  useEffect(() => {
    fetchOrdens();
  }, [fetchOrdens]);

  return { ordens, loading, error, refetch: fetchOrdens };
}

import { useState, useEffect, useCallback } from 'react';
import { OrdemServico } from '../types';
import BASE_URL from '../services/api';

export function useOrdensServico(tecnicoId?: number) {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrdens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = tecnicoId
        ? `${BASE_URL}/ordensServico?tecnicoId=${tecnicoId}`
        : `${BASE_URL}/ordensServico`;
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error('Erro ao buscar ordens');
      const dados: OrdemServico[] = await resposta.json();
      setOrdens(dados);
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

jest.mock('axios', () => ({
  create: jest.fn(() => ({ get: jest.fn(), post: jest.fn(), patch: jest.fn(), defaults: {} })),
}));
jest.mock('../../services/api');

import { renderHook, waitFor } from '@testing-library/react-native';
import { useOrdensServico } from '../../hooks/useOrdensServico';
import api from '../../services/api';
const mockedApi = api as jest.Mocked<typeof api>;

const ordensFixture = [
  {
    id: 1,
    descricao: 'Instalação de fibra óptica',
    local: 'Poste 45',
    tecnicoId: 1,
    status: 'pendente',
    prioridade: 'alta',
    normas: ['NR-35'],
    episObrigatorios: [1, 3],
    dataCriacao: '2026-04-19',
    dataLimite: '2026-04-22',
  },
];

describe('useOrdensServico', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna ordens ao carregar com sucesso', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: ordensFixture });

    const { result } = renderHook(() => useOrdensServico());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.ordens).toHaveLength(1);
    expect(result.current.ordens[0].descricao).toBe('Instalação de fibra óptica');
    expect(result.current.error).toBeNull();
  });

  it('seta erro quando a API falha', async () => {
    mockedApi.get = jest.fn().mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useOrdensServico());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.ordens).toHaveLength(0);
    expect(result.current.error).toBe(
      'Erro ao carregar ordens de serviço. Verifique a conexão.'
    );
  });

  it('filtra por tecnicoId quando fornecido', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: ordensFixture });

    renderHook(() => useOrdensServico(1));

    await waitFor(() =>
      expect(mockedApi.get).toHaveBeenCalledWith('/ordensServico', {
        params: { tecnicoId: 1 },
      })
    );
  });

  it('chama sem params quando tecnicoId não é fornecido', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: [] });

    renderHook(() => useOrdensServico());

    await waitFor(() =>
      expect(mockedApi.get).toHaveBeenCalledWith('/ordensServico', { params: {} })
    );
  });
});

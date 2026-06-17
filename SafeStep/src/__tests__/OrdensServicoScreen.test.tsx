import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import OrdensServicoScreen from '../screens/OrdensServicoScreen';

// Dentro do factory do jest.mock é permitido usar require()
jest.mock('@react-navigation/native', () => {
  const ReactNative = require('react');
  return {
    useFocusEffect: (cb: () => void) => {
      ReactNative.useEffect(() => { cb(); }, []);
    },
  };
});

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate } as any;

global.fetch = jest.fn();

const mockOrdens = [
  {
    id: 1,
    descricao: 'Instalação de fibra óptica',
    local: 'Poste 45',
    tecnicoId: 1,
    status: 'pendente',
    prioridade: 'alta',
    normas: ['NR-10'],
    episObrigatorios: [],
    dataCriacao: '2026-01-01',
    dataLimite: '2026-06-01',
  },
  {
    id: 2,
    descricao: 'Revisão de painel elétrico',
    local: 'Subestação 3',
    tecnicoId: 1,
    status: 'concluida',
    prioridade: 'media',
    normas: ['NR-35'],
    episObrigatorios: [],
    dataCriacao: '2026-01-02',
    dataLimite: '2026-06-02',
  },
];

function fetchOk(data: unknown) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);
}

describe('OrdensServicoScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
  });

  it('exibe indicador de loading ao iniciar', () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    const { getByText } = render(<OrdensServicoScreen navigation={navigation} />);
    expect(getByText('Carregando ordens...')).toBeTruthy();
  });

  it('renderiza as ordens após o fetch', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchOk(mockOrdens));
    const { getByText } = render(<OrdensServicoScreen navigation={navigation} />);

    await waitFor(() => {
      expect(getByText('Instalação de fibra óptica')).toBeTruthy();
      expect(getByText('Revisão de painel elétrico')).toBeTruthy();
    });
  });

  it('mostra mensagem de erro quando o servidor falha', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    const { getByText } = render(<OrdensServicoScreen navigation={navigation} />);

    await waitFor(() => {
      expect(
        getByText('Não foi possível carregar as ordens. Verifique a conexão.')
      ).toBeTruthy();
    });
  });

  it('filtra apenas ordens pendentes ao clicar no filtro', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchOk(mockOrdens));
    const { getByText, queryByText } = render(<OrdensServicoScreen navigation={navigation} />);

    await waitFor(() => getByText('Instalação de fibra óptica'));

    fireEvent.press(getByText('Pendentes'));

    await waitFor(() => {
      expect(getByText('Instalação de fibra óptica')).toBeTruthy();
      expect(queryByText('Revisão de painel elétrico')).toBeNull();
    });
  });

  it('navega para Checklist ao clicar em ordem pendente', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchOk(mockOrdens));
    const { getByText } = render(<OrdensServicoScreen navigation={navigation} />);

    await waitFor(() => getByText('Instalação de fibra óptica'));
    fireEvent.press(getByText('Instalação de fibra óptica'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Checklist', { ordemId: 1 });
    });
  });

  it('faz GET em /ordensServico ao carregar a tela', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchOk(mockOrdens));
    render(<OrdensServicoScreen navigation={navigation} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ordensServico')
      );
    });
  });
});

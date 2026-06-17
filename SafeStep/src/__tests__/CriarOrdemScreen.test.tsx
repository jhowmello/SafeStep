import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CriarOrdemScreen from '../screens/CriarOrdemScreen';

const mockGoBack = jest.fn();
const navigation = { goBack: mockGoBack } as any;

global.fetch = jest.fn();

function fetchOk() {
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
}

describe('CriarOrdemScreen — validações do formulário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
  });

  it('exibe alerta quando descrição está vazia', async () => {
    const { getByText } = render(<CriarOrdemScreen navigation={navigation} />);
    fireEvent.press(getByText('Salvar Ordem'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Informe a descrição da ordem.');
    });
  });

  it('exibe alerta quando local está vazio', async () => {
    const { getByPlaceholderText, getByText } = render(<CriarOrdemScreen navigation={navigation} />);
    fireEvent.changeText(getByPlaceholderText('Ex: Instalação de fibra óptica'), 'Manutenção de rede');
    fireEvent.press(getByText('Salvar Ordem'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Informe o local de execução.');
    });
  });

  it('exibe alerta quando nenhuma norma é selecionada', async () => {
    const { getByPlaceholderText, getByText } = render(<CriarOrdemScreen navigation={navigation} />);
    fireEvent.changeText(getByPlaceholderText('Ex: Instalação de fibra óptica'), 'Manutenção de rede');
    fireEvent.changeText(getByPlaceholderText('Ex: Poste 45 - Rua das Flores'), 'Poste 10');
    fireEvent.press(getByText('Salvar Ordem'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Selecione ao menos uma norma.');
    });
  });

  it('exibe alerta quando data limite está vazia', async () => {
    const { getByPlaceholderText, getByText } = render(<CriarOrdemScreen navigation={navigation} />);
    fireEvent.changeText(getByPlaceholderText('Ex: Instalação de fibra óptica'), 'Manutenção de rede');
    fireEvent.changeText(getByPlaceholderText('Ex: Poste 45 - Rua das Flores'), 'Poste 10');
    fireEvent.press(getByText('NR-10'));
    fireEvent.press(getByText('Salvar Ordem'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Informe a data limite.');
    });
  });

  it('faz POST em /ordensServico com formulário válido', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchOk());

    const { getByPlaceholderText, getByText } = render(<CriarOrdemScreen navigation={navigation} />);
    fireEvent.changeText(getByPlaceholderText('Ex: Instalação de fibra óptica'), 'Manutenção de rede');
    fireEvent.changeText(getByPlaceholderText('Ex: Poste 45 - Rua das Flores'), 'Poste 10');
    fireEvent.press(getByText('NR-10'));
    fireEvent.changeText(getByPlaceholderText('AAAA-MM-DD'), '2026-06-01');
    fireEvent.press(getByText('Salvar Ordem'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ordensServico'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('envia status "pendente" ao criar nova ordem', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchOk());

    const { getByPlaceholderText, getByText } = render(<CriarOrdemScreen navigation={navigation} />);
    fireEvent.changeText(getByPlaceholderText('Ex: Instalação de fibra óptica'), 'Manutenção');
    fireEvent.changeText(getByPlaceholderText('Ex: Poste 45 - Rua das Flores'), 'Poste 10');
    fireEvent.press(getByText('NR-10'));
    fireEvent.changeText(getByPlaceholderText('AAAA-MM-DD'), '2026-06-01');
    fireEvent.press(getByText('Salvar Ordem'));

    await waitFor(() => {
      const chamada = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(chamada[1].body);
      expect(body.status).toBe('pendente');
    });
  });
});

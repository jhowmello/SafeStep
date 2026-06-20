import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../screens/LoginScreen';

// Mock de navegação
const mockReplace = jest.fn();
const mockNavigate = jest.fn();
const navigation = { replace: mockReplace, navigate: mockNavigate } as any;

// Mock do fetch global
global.fetch = jest.fn();

const mockTecnico = { id: 1, nome: 'João Silva', matricula: 'TEC123', email: 'joao@test.com', cargo: 'Eletricista' };

function fetchOk(data: unknown) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);
}

function fetchErro(status: number, data: unknown) {
  return Promise.resolve({ ok: false, status, json: () => Promise.resolve(data) } as Response);
}

function fetchFail() {
  return Promise.reject(new Error('Network error'));
}

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
  });

  it('renderiza os campos de e-mail e senha', () => {
    const { getByPlaceholderText } = render(<LoginScreen navigation={navigation} />);
    expect(getByPlaceholderText('seu@email.com')).toBeTruthy();
    expect(getByPlaceholderText('••••••')).toBeTruthy();
  });

  it('exibe alerta quando campos estão vazios', async () => {
    const { getByText } = render(<LoginScreen navigation={navigation} />);
    fireEvent.press(getByText('Entrar'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Preencha e-mail e senha.');
    });
  });

  it('navega para HomeTabs com credenciais corretas', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchOk(mockTecnico));

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={navigation} />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'joao@test.com');
    fireEvent.changeText(getByPlaceholderText('••••••'), 'MinhaSenh@123');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('HomeTabs');
    });
  });

  it('exibe "Acesso negado" com credenciais erradas', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(
      fetchErro(401, { erro: 'E-mail ou senha invalidos.' })
    );

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={navigation} />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'errado@test.com');
    fireEvent.changeText(getByPlaceholderText('••••••'), 'senhaerrada');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Acesso negado', 'E-mail ou senha invalidos.');
    });
  });

  it('exibe erro de conexão quando o servidor não responde', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchFail());

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={navigation} />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'joao@test.com');
    fireEvent.changeText(getByPlaceholderText('••••••'), 'MinhaSenh@123');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Acesso negado', expect.any(String));
    });
  });

  it('faz POST em /auth/login com e-mail e senha', async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchOk(mockTecnico));

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={navigation} />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'joao@test.com');
    fireEvent.changeText(getByPlaceholderText('••••••'), 'MinhaSenh@123');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('navega para a tela de Cadastro ao tocar em "Criar conta"', () => {
    const { getByTestId } = render(<LoginScreen navigation={navigation} />);
    fireEvent.press(getByTestId('btn-criar-conta'));
    expect(mockNavigate).toHaveBeenCalledWith('Cadastro');
  });
});

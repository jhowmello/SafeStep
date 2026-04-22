import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OrdemCard from '../../components/OrdemCard';
import { OrdemServico } from '../../types';

const ordemBase: OrdemServico = {
  id: 1,
  descricao: 'Manutenção elétrica',
  local: 'Subestação Centro',
  tecnicoId: 1,
  status: 'pendente',
  prioridade: 'alta',
  normas: ['NR-10'],
  episObrigatorios: [1, 2],
  dataCriacao: '2026-04-19',
  dataLimite: '2026-04-22',
};

describe('OrdemCard', () => {
  it('renderiza a descrição da ordem', () => {
    const { getByText } = render(
      <OrdemCard ordem={ordemBase} onPress={() => {}} />
    );
    expect(getByText('Manutenção elétrica')).toBeTruthy();
  });

  it('renderiza o local', () => {
    const { getByText } = render(
      <OrdemCard ordem={ordemBase} onPress={() => {}} />
    );
    expect(getByText('📍 Subestação Centro')).toBeTruthy();
  });

  it('renderiza a norma', () => {
    const { getByText } = render(
      <OrdemCard ordem={ordemBase} onPress={() => {}} />
    );
    expect(getByText('NR-10')).toBeTruthy();
  });

  it('renderiza o badge de prioridade em maiúsculo', () => {
    const { getByText } = render(
      <OrdemCard ordem={ordemBase} onPress={() => {}} />
    );
    expect(getByText('ALTA')).toBeTruthy();
  });

  it('chama onPress ao tocar no card', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <OrdemCard ordem={ordemBase} onPress={onPress} />
    );
    fireEvent.press(getByText('Manutenção elétrica'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renderiza status corretamente', () => {
    const { getByText } = render(
      <OrdemCard ordem={{ ...ordemBase, status: 'concluida' }} onPress={() => {}} />
    );
    expect(getByText('✅ Concluída')).toBeTruthy();
  });
});

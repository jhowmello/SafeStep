import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChecklistItemRow from '../../components/ChecklistItemRow';
import { ChecklistItem } from '../../types';

const itemBase: ChecklistItem = {
  id: 1,
  descricao: 'EPIs estão em boas condições?',
  norma: 'NR-6',
  obrigatorio: true,
};

describe('ChecklistItemRow', () => {
  it('renderiza a descrição do item', () => {
    const { getByText } = render(
      <ChecklistItemRow item={itemBase} checked={false} onToggle={() => {}} />
    );
    expect(getByText('EPIs estão em boas condições?')).toBeTruthy();
  });

  it('renderiza a norma', () => {
    const { getByText } = render(
      <ChecklistItemRow item={itemBase} checked={false} onToggle={() => {}} />
    );
    expect(getByText('NR-6')).toBeTruthy();
  });

  it('exibe "Obrigatório" quando obrigatorio=true', () => {
    const { getByText } = render(
      <ChecklistItemRow item={itemBase} checked={false} onToggle={() => {}} />
    );
    expect(getByText('Obrigatório')).toBeTruthy();
  });

  it('não exibe "Obrigatório" quando obrigatorio=false', () => {
    const { queryByText } = render(
      <ChecklistItemRow
        item={{ ...itemBase, obrigatorio: false }}
        checked={false}
        onToggle={() => {}}
      />
    );
    expect(queryByText('Obrigatório')).toBeNull();
  });

  it('chama onToggle ao pressionar', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <ChecklistItemRow item={itemBase} checked={false} onToggle={onToggle} />
    );
    fireEvent.press(getByText('EPIs estão em boas condições?'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('exibe o checkmark quando checked=true', () => {
    const { getByText } = render(
      <ChecklistItemRow item={itemBase} checked={true} onToggle={() => {}} />
    );
    expect(getByText('✓')).toBeTruthy();
  });

  it('não exibe checkmark quando checked=false', () => {
    const { queryByText } = render(
      <ChecklistItemRow item={itemBase} checked={false} onToggle={() => {}} />
    );
    expect(queryByText('✓')).toBeNull();
  });
});

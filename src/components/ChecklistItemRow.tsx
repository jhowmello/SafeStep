import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChecklistItem } from '../types';

interface Props {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
}

export default function ChecklistItemRow({ item, checked, onToggle }: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.content}>
        <Text style={[styles.descricao, checked && styles.descricaoChecked]}>
          {item.descricao}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.norma}>{item.norma}</Text>
          {item.obrigatorio && <Text style={styles.obrigatorio}>Obrigatório</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  descricao: {
    fontSize: 15,
    color: '#1a1a2e',
    marginBottom: 4,
  },
  descricaoChecked: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
  },
  norma: {
    fontSize: 12,
    color: '#F5A623',
    fontWeight: '500',
  },
  obrigatorio: {
    fontSize: 12,
    color: '#F44336',
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrdemServico } from '../types';

interface Props {
  ordem: OrdemServico;
  onPress: () => void;
  onDelete: () => void;
}

const prioridadeCor: Record<string, string> = {
  baixa: '#4CAF50',
  media: '#FF9800',
  alta: '#F44336',
  critica: '#9C27B0',
};

const statusLabel: Record<string, string> = {
  pendente: '🕐 Pendente',
  concluida: '✅ Concluída',
  reprovada: '❌ Reprovada',
};

export default function OrdemCard({ ordem, onPress, onDelete }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: prioridadeCor[ordem.prioridade] }]}>
          <Text style={styles.badgeText}>{ordem.prioridade.toUpperCase()}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.status}>{statusLabel[ordem.status]}</Text>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onDelete(); }}
            style={styles.deleteBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.descricao}>{ordem.descricao}</Text>
      <Text style={styles.local}>📍 {ordem.local}</Text>
      <View style={styles.footer}>
        <Text style={styles.normas}>{ordem.normas.join(' • ')}</Text>
        <Text style={styles.data}>Prazo: {ordem.dataLimite}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 13,
    color: '#555',
  },
  descricao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  local: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  normas: {
    fontSize: 12,
    color: '#F5A623',
    fontWeight: '500',
  },
  data: {
    fontSize: 12,
    color: '#888',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteBtn: {
    padding: 2,
  },
});

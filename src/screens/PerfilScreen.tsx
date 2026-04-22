import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function PerfilScreen({ navigation }: Props) {
  const tecnico = {
    nome: 'João Silva',
    matricula: 'TEC123',
    cargo: 'Eletricista',
    email: 'joao.silva@safestep.com',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>👷</Text>
        <Text style={styles.nome}>{tecnico.nome}</Text>
        <Text style={styles.cargo}>{tecnico.cargo}</Text>
      </View>

      <View style={styles.card}>
        <InfoRow label="Matrícula" value={tecnico.matricula} />
        <InfoRow label="E-mail" value={tecnico.email} />
        <InfoRow label="Cargo" value={tecnico.cargo} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Certificações</Text>
        <InfoRow label="NR-10" value="✅ Válido" />
        <InfoRow label="NR-35" value="✅ Válido" />
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => navigation.replace('Login')}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  content: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    fontSize: 72,
    marginBottom: 10,
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  cargo: {
    fontSize: 14,
    color: '#F5A623',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 15,
    color: '#666',
  },
  value: {
    fontSize: 15,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

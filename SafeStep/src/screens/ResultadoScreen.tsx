import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Resultado'>;
  route: RouteProp<RootStackParamList, 'Resultado'>;
};

export default function ResultadoScreen({ navigation, route }: Props) {
  const { aprovado } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: aprovado ? '#e8f5e9' : '#ffebee' }]}>
      <View style={styles.card}>
        <Text style={styles.icon}>{aprovado ? '✅' : '❌'}</Text>
        <Text style={[styles.titulo, { color: aprovado ? '#2E7D32' : '#C62828' }]}>
          {aprovado ? 'Aprovado!' : 'Reprovado'}
        </Text>
        <Text style={styles.descricao}>
          {aprovado
            ? 'Todos os itens obrigatórios foram confirmados.\nO log de conformidade foi registrado.'
            : 'Itens obrigatórios não foram confirmados.\nO registro foi salvo para auditoria.'}
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {aprovado
              ? '🛡️ Atividade liberada conforme NR-10 / NR-35'
              : '⚠️ Atividade bloqueada por não conformidade'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: aprovado ? '#2E7D32' : '#C62828' }]}
          onPress={() => navigation.navigate('HomeTabs')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Voltar ao Início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  icon: {
    fontSize: 72,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descricao: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    width: '100%',
    marginBottom: 28,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

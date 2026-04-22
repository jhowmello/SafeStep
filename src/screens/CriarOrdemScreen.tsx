import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import api from '../services/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CriarOrdem'>;
};

type Prioridade = 'baixa' | 'media' | 'alta' | 'critica';

const PRIORIDADES: { key: Prioridade; label: string; cor: string }[] = [
  { key: 'baixa',   label: 'Baixa',   cor: '#4CAF50' },
  { key: 'media',   label: 'Média',   cor: '#FF9800' },
  { key: 'alta',    label: 'Alta',    cor: '#F44336' },
  { key: 'critica', label: 'Crítica', cor: '#9C27B0' },
];

const NORMAS_OPCOES = ['NR-10', 'NR-35'];

export default function CriarOrdemScreen({ navigation }: Props) {
  const [descricao, setDescricao]   = useState('');
  const [local, setLocal]           = useState('');
  const [prioridade, setPrioridade] = useState<Prioridade>('media');
  const [normas, setNormas]         = useState<string[]>([]);
  const [dataLimite, setDataLimite] = useState('');
  const [salvando, setSalvando]     = useState(false);

  function toggleNorma(norma: string) {
    setNormas((prev) =>
      prev.includes(norma) ? prev.filter((n) => n !== norma) : [...prev, norma]
    );
  }

  async function handleSalvar() {
    if (!descricao.trim()) {
      Alert.alert('Atenção', 'Informe a descrição da ordem.');
      return;
    }
    if (!local.trim()) {
      Alert.alert('Atenção', 'Informe o local de execução.');
      return;
    }
    if (normas.length === 0) {
      Alert.alert('Atenção', 'Selecione ao menos uma norma.');
      return;
    }
    if (!dataLimite.trim()) {
      Alert.alert('Atenção', 'Informe a data limite.');
      return;
    }

    setSalvando(true);
    try {
      await api.post('/ordensServico', {
        descricao: descricao.trim(),
        local: local.trim(),
        tecnicoId: 1,
        status: 'pendente',
        prioridade,
        normas,
        episObrigatorios: [],
        dataCriacao: new Date().toISOString().split('T')[0],
        dataLimite: dataLimite.trim(),
      });

      Alert.alert('Sucesso', 'Ordem de serviço criada!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a ordem.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Instalação de fibra óptica"
          placeholderTextColor="#bbb"
          value={descricao}
          onChangeText={setDescricao}
          multiline
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Local</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Poste 45 - Rua das Flores"
          placeholderTextColor="#bbb"
          value={local}
          onChangeText={setLocal}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Prioridade</Text>
        <View style={styles.optionsRow}>
          {PRIORIDADES.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.optionBtn,
                prioridade === p.key && { backgroundColor: p.cor, borderColor: p.cor },
              ]}
              onPress={() => setPrioridade(p.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, prioridade === p.key && styles.optionTextAtivo]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Normas</Text>
        <View style={styles.optionsRow}>
          {NORMAS_OPCOES.map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.optionBtn, normas.includes(n) && styles.optionBtnAtivo]}
              onPress={() => toggleNorma(n)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, normas.includes(n) && styles.optionTextAtivo]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Data Limite</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          placeholderTextColor="#bbb"
          value={dataLimite}
          onChangeText={setDataLimite}
          maxLength={10}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, salvando && styles.buttonDisabled]}
        onPress={handleSalvar}
        disabled={salvando}
        activeOpacity={0.85}
      >
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Salvar Ordem</Text>
          </View>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e6ef',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a2e',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  optionBtnAtivo: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  optionText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  optionTextAtivo: {
    color: '#fff',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#F5A623',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

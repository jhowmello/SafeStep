import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, ChecklistItem, OrdemServico } from '../types';
import ChecklistItemRow from '../components/ChecklistItemRow';
import api from '../services/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Checklist'>;
  route: RouteProp<RootStackParamList, 'Checklist'>;
};

export default function ChecklistScreen({ navigation, route }: Props) {
  const { ordemId } = route.params;

  const [itens, setItens]       = useState<ChecklistItem[]>([]);
  const [ordem, setOrdem]       = useState<OrdemServico | null>(null);
  const [marcados, setMarcados] = useState<Set<number>>(new Set());
  const [loading, setLoading]   = useState(true);
  const [salvando, setSalvando] = useState(false);

  // ─── useEffect: carrega itens do checklist e dados da ordem ───────────────
  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      try {
        const [resItens, resOrdem] = await Promise.all([
          api.get<ChecklistItem[]>('/checklistItens'),
          api.get<OrdemServico>(`/ordensServico/${ordemId}`),
        ]);

        if (!cancelado) {
          setItens(resItens.data);
          setOrdem(resOrdem.data);
        }
      } catch {
        if (!cancelado) {
          Alert.alert('Erro', 'Não foi possível carregar o checklist.');
          navigation.goBack();
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregar();

    // cleanup: evita atualizar estado em componente desmontado
    return () => { cancelado = true; };
  }, [ordemId]);

  // ─── useEffect: atualiza título do header com o progresso ────────────────
  useEffect(() => {
    navigation.setOptions({
      title: `Checklist (${marcados.size}/${itens.length})`,
    });
  }, [marcados.size, itens.length]);

  // ─── Toggle de item marcado ───────────────────────────────────────────────
  const toggleItem = useCallback((id: number) => {
    setMarcados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ─── Render de cada item da FlatList ──────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChecklistItem>) => (
      <ChecklistItemRow
        item={item}
        checked={marcados.has(item.id)}
        onToggle={() => toggleItem(item.id)}
      />
    ),
    [marcados, toggleItem],
  );

  // ─── Header da FlatList com info da ordem ────────────────────────────────
  function ListHeader() {
    if (!ordem) return null;
    return (
      <View style={styles.ordemInfo}>
        <Text style={styles.ordemDescricao}>{ordem.descricao}</Text>
        <Text style={styles.ordemLocal}>
          <Ionicons name="location-outline" size={13} color="#888" /> {ordem.local}
        </Text>
        <View style={styles.normasRow}>
          {ordem.normas.map((n) => (
            <View key={n} style={styles.normaBadge}>
              <Text style={styles.normaText}>{n}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // ─── Separador ────────────────────────────────────────────────────────────
  function ItemSeparator() {
    return <View style={styles.separator} />;
  }

  // ─── Concluir checklist ───────────────────────────────────────────────────
  async function handleConcluir() {
    const pendentes = itens.filter((i) => i.obrigatorio && !marcados.has(i.id));

    if (pendentes.length > 0) {
      Alert.alert(
        'Itens obrigatórios pendentes',
        `${pendentes.length} item(ns) obrigatório(s) não confirmado(s):\n\n${pendentes.map((p) => `• ${p.descricao}`).join('\n')}`,
      );
      return;
    }

    const aprovado = itens.every((i) => !i.obrigatorio || marcados.has(i.id));

    setSalvando(true);
    try {
      await Promise.all([
        api.post('/checklists', {
          ordemServicoId: ordemId,
          tecnicoId: 1,
          dataRealizacao: new Date().toISOString().split('T')[0],
          aprovado,
          itensConfirmados: Array.from(marcados),
          observacoes: '',
        }),
        api.post('/logs', {
          ordemServicoId: ordemId,
          tecnicoId: 1,
          acao: 'checklist_concluido',
          resultado: aprovado ? 'aprovado' : 'reprovado',
          timestamp: new Date().toISOString(),
        }),
        api.patch(`/ordensServico/${ordemId}`, {
          status: aprovado ? 'concluida' : 'reprovada',
        }),
      ]);

      navigation.replace('Resultado', { aprovado, ordemId });
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o checklist.');
    } finally {
      setSalvando(false);
    }
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F5A623" />
        <Text style={styles.loadingText}>Carregando checklist...</Text>
      </View>
    );
  }

  const progresso = itens.length > 0 ? (marcados.size / itens.length) * 100 : 0;
  const obrigatoriosPendentes = itens.filter((i) => i.obrigatorio && !marcados.has(i.id)).length;

  return (
    <View style={styles.container}>
      {/* Barra de progresso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            {marcados.size} de {itens.length} itens confirmados
          </Text>
          <Text style={styles.progressPercent}>{Math.round(progresso)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progresso}%` }]} />
        </View>
        {obrigatoriosPendentes > 0 && (
          <Text style={styles.alertObrigatorios}>
            ⚠️ {obrigatoriosPendentes} item(ns) obrigatório(s) pendente(s)
          </Text>
        )}
      </View>

      {/* FlatList com header, itens e separador */}
      <FlatList
        data={itens}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Botão fixo no rodapé */}
      <TouchableOpacity
        style={[styles.button, salvando && styles.buttonDisabled]}
        onPress={handleConcluir}
        disabled={salvando}
        activeOpacity={0.85}
      >
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Concluir Checklist</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },

  // Progresso
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#555',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F5A623',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F5A623',
    borderRadius: 4,
  },
  alertObrigatorios: {
    marginTop: 8,
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },

  // Info da ordem (header da lista)
  ordemInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F5A623',
  },
  ordemDescricao: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  ordemLocal: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  normasRow: {
    flexDirection: 'row',
    gap: 6,
  },
  normaBadge: {
    backgroundColor: '#FFF0D6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  normaText: {
    fontSize: 11,
    color: '#F5A623',
    fontWeight: '700',
  },

  // Lista
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  separator: {
    height: 0,
  },

  // Botão
  button: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#F5A623',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
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

import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ListRenderItemInfo,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, OrdemServico } from '../types';
import OrdemCard from '../components/OrdemCard';
import api from '../services/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

type Filtro = 'todos' | 'pendente' | 'concluida' | 'reprovada';

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'todos',    label: 'Todos'     },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'concluida', label: 'Concluídas' },
  { key: 'reprovada', label: 'Reprovadas' },
];

export default function OrdensServicoScreen({ navigation }: Props) {
  const [ordens, setOrdens]       = useState<OrdemServico[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [filtro, setFiltro]       = useState<Filtro>('todos');

  // ─── Busca as ordens na API ────────────────────────────────────────────────
  const fetchOrdens = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const response = await api.get<OrdemServico[]>('/ordensServico');
      setOrdens(response.data);
    } catch {
      setError('Não foi possível carregar as ordens. Verifique a conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ─── Recarrega ao focar a tela (inclui volta da tela de criação) ─────────
  useFocusEffect(
    useCallback(() => {
      fetchOrdens();
    }, [fetchOrdens])
  );

  // ─── Filtragem local ───────────────────────────────────────────────────────
  const ordensFiltradas =
    filtro === 'todos' ? ordens : ordens.filter((o) => o.status === filtro);

  // ─── Deletar ordem ────────────────────────────────────────────────────────
  async function confirmarDelete(id: number) {
    try {
      await api.delete(`/ordensServico/${id}`);
      setOrdens((prev) => prev.filter((o) => o.id !== id));
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir a ordem.');
    }
  }

  function handleDelete(id: number) {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
        confirmarDelete(id);
      }
      return;
    }
    Alert.alert(
      'Excluir ordem',
      'Tem certeza que deseja excluir esta ordem de serviço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmarDelete(id),
        },
      ]
    );
  }

  // ─── Render de cada item da FlatList ──────────────────────────────────────
  function renderItem({ item }: ListRenderItemInfo<OrdemServico>) {
    return (
      <OrdemCard
        ordem={item}
        onPress={() => {
          if (item.status === 'pendente') {
            navigation.navigate('Checklist', { ordemId: item.id });
          }
        }}
        onDelete={() => handleDelete(item.id)}
      />
    );
  }

  // ─── Separador entre itens ────────────────────────────────────────────────
  function ItemSeparator() {
    return <View style={styles.separator} />;
  }

  // ─── Header da lista (filtros) ────────────────────────────────────────────
  function ListHeader() {
    return (
      <View style={styles.filtrosContainer}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtroBtn, filtro === f.key && styles.filtroBtnAtivo]}
            onPress={() => setFiltro(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filtroText, filtro === f.key && styles.filtroTextAtivo]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // ─── Estado vazio ─────────────────────────────────────────────────────────
  function ListEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="clipboard-outline" size={56} color="#ccc" />
        <Text style={styles.emptyTitle}>Nenhuma ordem encontrada</Text>
        <Text style={styles.emptySubtitle}>
          {filtro !== 'todos'
            ? 'Tente mudar o filtro acima.'
            : 'Nenhuma ordem de serviço disponível.'}
        </Text>
      </View>
    );
  }

  // ─── Footer da lista ──────────────────────────────────────────────────────
  function ListFooter() {
    if (ordensFiltradas.length === 0) return null;
    return (
      <Text style={styles.footerText}>
        {ordensFiltradas.length} ordem{ordensFiltradas.length !== 1 ? 's' : ''} exibida{ordensFiltradas.length !== 1 ? 's' : ''}
      </Text>
    );
  }

  // ─── Loading inicial ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F5A623" />
        <Text style={styles.loadingText}>Carregando ordens...</Text>
      </View>
    );
  }

  // ─── Erro ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={56} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchOrdens()}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Lista principal ──────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CriarOrdem')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      <FlatList
        data={ordensFiltradas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrdens(true)}
            colors={['#F5A623']}
            tintColor="#F5A623"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  list: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },

  // Filtros
  filtrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    paddingTop: 8,
  },
  filtroBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF0D6',
  },
  filtroBtnAtivo: {
    backgroundColor: '#F5A623',
  },
  filtroText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  filtroTextAtivo: {
    color: '#fff',
    fontWeight: '700',
  },

  // Separador
  separator: {
    height: 0,
  },

  // Vazio
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#aaa',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
  },

  // Footer
  footerText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 12,
    marginTop: 16,
    marginBottom: 8,
  },

  // Loading / Erro
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    fontSize: 14,
  },
  retryBtn: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 10,
  },
});

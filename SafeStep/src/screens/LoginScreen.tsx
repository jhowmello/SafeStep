import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Tecnico } from '../types';
import BASE_URL from '../services/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      const resposta = await fetch(`${BASE_URL}/tecnicos`);
      if (!resposta.ok) throw new Error('Erro ao buscar técnicos');
      const tecnicos: Tecnico[] = await resposta.json();
      const tecnico = tecnicos.find(
        (t) => t.email === email.trim() && t.senha === senha
      );

      if (tecnico) {
        navigation.replace('HomeTabs');
      } else {
        Alert.alert('Acesso negado', 'E-mail ou senha inválidos.');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor.\nVerifique o IP e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Image source={require('../../assets/icon_safe.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.title}>SafeStep</Text>
          <Text style={styles.subtitle}>Segurança do Trabalho</Text>
          <View style={styles.normasBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NR-10</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NR-35</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar na conta</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="#bbb"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••"
                placeholderTextColor="#bbb"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!senhaVisivel}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity testID="btn-toggle-senha" onPress={() => setSenhaVisivel(!senhaVisivel)} style={styles.eyeBtn}>
                <Ionicons
                  name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            testID="btn-login"
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Entrar</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Uso restrito a técnicos autorizados
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D3D4F',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(245,166,35,0.85)',
    marginTop: 4,
    marginBottom: 14,
  },
  normasBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 20,
  },

  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e6ef',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1a1a2e',
  },
  eyeBtn: {
    padding: 4,
  },

  button: {
    backgroundColor: '#F5A623',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
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

  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 24,
  },
});

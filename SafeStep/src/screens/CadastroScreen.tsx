import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { registerTecnico } from '../services/auth';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Cadastro'>;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MATRICULA_REGEX = /^[A-Za-z0-9]{4,12}$/;
const NOME_REGEX = /^[\p{L}' -]{2,80}$/u;

// Critérios de senha alinhados ao OWASP ASVS V2.1 / Authentication Cheat
// Sheet. A validação definitiva sempre ocorre no servidor (lib/passwordPolicy
// no backend); esta checklist é apenas orientação visual para o usuário.
function avaliarSenha(senha: string) {
  const temMinuscula = /[a-z]/.test(senha);
  const temMaiuscula = /[A-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temSimbolo = /[^a-zA-Z0-9]/.test(senha);
  const classes = [temMinuscula, temMaiuscula, temNumero, temSimbolo].filter(Boolean).length;
  const comprimentoOk = senha.length >= 10;

  return {
    temMinuscula,
    temMaiuscula,
    temNumero,
    temSimbolo,
    comprimentoOk,
    valida: comprimentoOk && classes >= 3,
  };
}

export default function CadastroScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [cargo, setCargo] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarVisivel, setConfirmarVisivel] = useState(false);
  const [loading, setLoading] = useState(false);

  const avaliacaoSenha = useMemo(() => avaliarSenha(senha), [senha]);
  const senhasConferem = confirmarSenha.length > 0 && confirmarSenha === senha;

  function validarFormulario(): string | null {
    if (!NOME_REGEX.test(nome.trim())) {
      return 'Informe um nome válido (apenas letras e espaços, 2 a 80 caracteres).';
    }
    if (!MATRICULA_REGEX.test(matricula.trim())) {
      return 'Matrícula inválida. Use de 4 a 12 caracteres alfanuméricos.';
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return 'Informe um e-mail válido.';
    }
    if (cargo.trim().length < 2) {
      return 'Informe o cargo.';
    }
    if (!avaliacaoSenha.valida) {
      return 'A senha não atende aos critérios mínimos de segurança.';
    }
    if (!senhasConferem) {
      return 'As senhas não coincidem.';
    }
    return null;
  }

  async function handleCadastro() {
    const erro = validarFormulario();
    if (erro) {
      Alert.alert('Verifique os dados', erro);
      return;
    }

    setLoading(true);
    try {
      await registerTecnico({
        nome: nome.trim(),
        matricula: matricula.trim(),
        email: email.trim(),
        cargo: cargo.trim(),
        senha,
        confirmarSenha,
      });

      Alert.alert('Cadastro realizado', 'Sua conta foi criada. Faça login para continuar.', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Não foi possível concluir o cadastro.';
      Alert.alert('Erro no cadastro', mensagem);
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
        <TouchableOpacity
          testID="btn-voltar-login"
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Cadastro de técnico SafeStep</Text>
        </View>

        <View style={styles.card}>
          <Campo label="Nome completo">
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              placeholderTextColor="#bbb"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Campo>

          <Campo label="Matrícula">
            <TextInput
              style={styles.input}
              placeholder="Ex: TEC123"
              placeholderTextColor="#bbb"
              value={matricula}
              onChangeText={(v) => setMatricula(v.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
              returnKeyType="next"
            />
          </Campo>

          <Campo label="Cargo">
            <TextInput
              style={styles.input}
              placeholder="Ex: Eletricista"
              placeholderTextColor="#bbb"
              value={cargo}
              onChangeText={setCargo}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Campo>

          <Campo label="E-mail">
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
          </Campo>

          <Campo label="Senha">
            <View style={styles.senhaWrapper}>
              <TextInput
                style={styles.inputSenha}
                placeholder="Crie uma senha forte"
                placeholderTextColor="#bbb"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!senhaVisivel}
                returnKeyType="next"
              />
              <TouchableOpacity testID="btn-toggle-senha" onPress={() => setSenhaVisivel(!senhaVisivel)} style={styles.eyeBtn}>
                <Ionicons name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </Campo>

          {senha.length > 0 && (
            <View style={styles.checklist}>
              <RequisitoSenha ok={avaliacaoSenha.comprimentoOk} texto="Mínimo de 10 caracteres" />
              <RequisitoSenha ok={avaliacaoSenha.temMaiuscula} texto="Letra maiúscula" />
              <RequisitoSenha ok={avaliacaoSenha.temMinuscula} texto="Letra minúscula" />
              <RequisitoSenha ok={avaliacaoSenha.temNumero} texto="Número" />
              <RequisitoSenha ok={avaliacaoSenha.temSimbolo} texto="Símbolo (ex: ! @ # $)" />
            </View>
          )}

          <Campo label="Confirmar senha">
            <View style={styles.senhaWrapper}>
              <TextInput
                style={styles.inputSenha}
                placeholder="Repita a senha"
                placeholderTextColor="#bbb"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!confirmarVisivel}
                returnKeyType="done"
                onSubmitEditing={handleCadastro}
              />
              <TouchableOpacity testID="btn-toggle-confirmar-senha" onPress={() => setConfirmarVisivel(!confirmarVisivel)} style={styles.eyeBtn}>
                <Ionicons name={confirmarVisivel ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
              </TouchableOpacity>
            </View>
            {confirmarSenha.length > 0 && (
              <RequisitoSenha ok={senhasConferem} texto="As senhas coincidem" />
            )}
          </Campo>

          <TouchableOpacity
            testID="btn-cadastrar"
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCadastro}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="person-add-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Cadastrar</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Seus dados e sua senha são protegidos conforme boas práticas OWASP.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function RequisitoSenha({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <View style={styles.requisitoRow}>
      <Ionicons
        name={ok ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={ok ? '#2E7D32' : '#999'}
      />
      <Text style={[styles.requisitoTexto, ok && styles.requisitoTextoOk]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D3D4F',
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
    padding: 4,
  },
  backText: {
    color: '#fff',
    fontSize: 15,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(245,166,35,0.85)',
    marginTop: 4,
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
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e6ef',
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1a1a2e',
  },
  senhaWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e6ef',
    paddingHorizontal: 12,
  },
  inputSenha: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1a1a2e',
  },
  eyeBtn: {
    padding: 4,
  },

  checklist: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 12,
    marginTop: -6,
    marginBottom: 16,
    gap: 4,
  },
  requisitoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requisitoTexto: {
    fontSize: 12.5,
    color: '#999',
  },
  requisitoTextoOk: {
    color: '#2E7D32',
    fontWeight: '600',
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

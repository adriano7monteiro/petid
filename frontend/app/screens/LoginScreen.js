import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthAPI, PetsAPI, setAuthToken } from '../../services/api';
import { saveToken } from '../../utils/auth';

export default function LoginScreen({ navigation }){
  const [email, setEmail] = useState('demo@petid.app');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const onRegister = async ()=>{
    if(!email || !password) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha email e senha.');
      return;
    }
    
    setLoading(true);
    try{
      await AuthAPI.register(email, password);
      Alert.alert('✅ Cadastro concluído', 'Sua conta foi criada com sucesso! Agora faça login.');
      setIsRegisterMode(false);
    }catch(e){
      const errorMsg = e?.response?.data?.detail || 'Falha ao registrar. Tente novamente.';
      Alert.alert('❌ Erro no cadastro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async ()=>{
    if(!email || !password) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha email e senha.');
      return;
    }
    
    setLoading(true);
    try{
      const res = await AuthAPI.login(email, password);
      const token = res.data?.access_token;
      if(!token) throw new Error('Sem token');
      setAuthToken(token);
      await saveToken(token);

      const list = await PetsAPI.listMine().then(r=>r.data).catch(()=>[]);
      if(!list || list.length === 0){
        await PetsAPI.create({ name:'Thor', species:'Cão', breed:'SRD', age:4, weight:18 });
      }
      navigation.replace('Home');
    }catch(e){
      console.error('Login error:', e);
      let errorMsg = 'Verifique suas credenciais e API.';
      if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
        errorMsg = 'Não foi possível conectar à API. Verifique sua conexão.';
      } else if (e.response) {
        errorMsg = e.response.data?.detail || `Erro ${e.response.status}: ${e.response.statusText}`;
      } else if (e.message) {
        errorMsg = e.message;
      }
      Alert.alert('❌ Login falhou', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🐾</Text>
          </View>
          <Text style={styles.title}>PetID</Text>
          <Text style={styles.subtitle}>Seu pet, sempre bem cuidado</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, !isRegisterMode && styles.tabActive]}
              onPress={() => setIsRegisterMode(false)}
            >
              <Text style={[styles.tabText, !isRegisterMode && styles.tabTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, isRegisterMode && styles.tabActive]}
              onPress={() => setIsRegisterMode(true)}
            >
              <Text style={[styles.tabText, isRegisterMode && styles.tabTextActive]}>
                Criar Conta
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput 
              placeholder="seu@email.com" 
              value={email} 
              onChangeText={setEmail} 
              style={styles.input} 
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput 
              placeholder="Sua senha" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              style={styles.input}
              editable={!loading}
            />
          </View>

          {!isRegisterMode && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
            onPress={isRegisterMode ? onRegister : onLogin}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? '⏳ Aguarde...' : (isRegisterMode ? '✓ Criar Conta' : '→ Entrar')}
            </Text>
          </TouchableOpacity>

          {isRegisterMode && (
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Ao criar uma conta, você concorda com nossos{' '}
                <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
                <Text style={styles.termsLink}>Política de Privacidade</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Demo Info */}
        <View style={styles.demoCard}>
          <Text style={styles.demoIcon}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.demoTitle}>Conta de demonstração</Text>
            <Text style={styles.demoText}>
              Email: demo@petid.app{'\n'}
              Senha: 123456
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#3b82f6',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#1f2937',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 15,
    color: '#1f2937',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  termsContainer: {
    marginTop: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  demoCard: {
    backgroundColor: '#fef3c7',
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  demoIcon: {
    fontSize: 24,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  demoText: {
    fontSize: 13,
    color: '#78350f',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthAPI, PetsAPI, setAuthToken } from '../../services/api';
import { saveToken } from '../../utils/auth';

export default function LoginScreen({ navigation }){
  const [email, setEmail] = useState('demo@petid.app');
  const [password, setPassword] = useState('123456');

  const onRegister = async ()=>{
    try{
      await AuthAPI.register(email, password);
      Alert.alert('Cadastro concluído', 'Agora faça login.');
    }catch(e){
      Alert.alert('Erro', e?.response?.data?.detail || 'Falha ao registrar');
    }
  };

  const onLogin = async ()=>{
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
        errorMsg = 'Não foi possível conectar à API. Verifique se o backend está rodando.';
      } else if (e.response) {
        errorMsg = e.response.data?.detail || `Erro ${e.response.status}: ${e.response.statusText}`;
      } else if (e.message) {
        errorMsg = e.message;
      }
      Alert.alert('Login falhou', errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PetID</Text>
      <Text style={styles.subtitle}>Seu pet, sempre cuidado 🐾</Text>
      <TextInput placeholder="E-mail" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.btn} onPress={onLogin}><Text style={styles.btnText}>Entrar</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.btn,{backgroundColor:'#27ae60'}]} onPress={onRegister}><Text style={styles.btnText}>Criar conta</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'center', padding:24, gap:12 },
  title:{ fontSize:36, fontWeight:'800', textAlign:'center' },
  subtitle:{ fontSize:16, textAlign:'center', color:'#666', marginBottom:12 },
  input:{ backgroundColor:'#fff', padding:14, borderRadius:12, borderWidth:1, borderColor:'#eee' },
  btn:{ backgroundColor:'#2f80ed', padding:16, borderRadius:12, marginTop:8 },
  btnText:{ color:'#fff', textAlign:'center', fontWeight:'700' },
});
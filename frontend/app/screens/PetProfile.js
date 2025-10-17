import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { api } from '../../services/api';

export default function PetProfile({ route }){
  const { petId } = route.params || {};
  const [name, setName] = useState('Thor');
  const [species, setSpecies] = useState('Cão');
  const [breed, setBreed] = useState('SRD');
  const [weight, setWeight] = useState('18');
  const [allergies, setAllergies] = useState('Nenhuma');

  const cardUrl = useMemo(()=> {
    // A URL já inclui /api, então basta adicionar /public/pet
    const baseUrl = api.defaults.baseURL.replace(/\/$/, '');
    return `${baseUrl}/public/pet/${petId || 'pet_demo'}`;
  }, [petId]);
  const onOpenCard = ()=> Linking.openURL(cardUrl);

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={styles.title}>Prontuário do Pet</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome" />
      <TextInput style={styles.input} value={species} onChangeText={setSpecies} placeholder="Espécie" />
      <TextInput style={styles.input} value={breed} onChangeText={setBreed} placeholder="Raça" />
      <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="Peso (kg)" keyboardType="decimal-pad" />
      <TextInput style={styles.input} value={allergies} onChangeText={setAllergies} placeholder="Alergias" />
      <View style={styles.qrBox}>
        <Text style={{ fontWeight:'600', marginBottom:8 }}>Carteirinha com QR</Text>
        <QRCode value={cardUrl} size={160} />
        <TouchableOpacity style={styles.btn} onPress={onOpenCard}><Text style={styles.btnText}>Abrir Carteirinha</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title:{ fontSize:20, fontWeight:'700', marginBottom:12 },
  input:{ backgroundColor:'#fff', padding:14, borderRadius:12, borderWidth:1, borderColor:'#eee', marginBottom:10 },
  qrBox:{ alignItems:'center', padding:16, backgroundColor:'#fff', borderRadius:16, borderWidth:1, borderColor:'#eee', marginTop:12 },
  btn:{ backgroundColor:'#2f80ed', padding:12, borderRadius:12, marginTop:12, width:'100%' },
  btnText:{ color:'#fff', textAlign:'center', fontWeight:'700' },
});
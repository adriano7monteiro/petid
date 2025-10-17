import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import PetCard from '../components/PetCard';
import { PetsAPI } from '../../services/api';

export default function Dashboard({ navigation }){
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);

  useEffect(()=>{ (async ()=>{
    try{
      const res = await PetsAPI.listMine();
      setPets(res.data || []);
    }catch(e){
      Alert.alert('Erro','Falha ao carregar pets. Verifique a API.');
    }finally{ setLoading(false); }
  })(); }, []);

  if(loading) return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator /></View>;

  const pet = pets[0];
  return (
    <ScrollView style={{ flex:1, padding:16 }}>
      <Text style={styles.hi}>Olá!</Text>
      {pet && <PetCard pet={{ id: pet.id, name: pet.name, species: pet.species, breed: pet.breed }} />}

      <View style={styles.grid}>
        <TouchableOpacity style={styles.tile} onPress={()=> navigation.navigate('Prontuario', { petId: pet?.id }) }>
          <Text style={styles.tileTitle}>Prontuário</Text>
          <Text style={styles.tileDesc}>Carteirinha digital + histórico</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tile} onPress={()=> navigation.navigate('Diario', { petId: pet?.id }) }>
          <Text style={styles.tileTitle}>Diário de Recuperação</Text>
          <Text style={styles.tileDesc}>Check-ins diários + relatório</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tile} onPress={()=> navigation.navigate('Saude', { petId: pet?.id }) }>
          <Text style={styles.tileTitle}>Desconfio que não está bem</Text>
          <Text style={styles.tileDesc}>Triagem guiada</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hi:{ fontSize:24, fontWeight:'700', marginBottom:12 },
  grid:{ gap:12, marginTop:12 },
  tile:{ backgroundColor:'#fff', padding:16, borderRadius:16, borderWidth:1, borderColor:'#eee' },
  tileTitle:{ fontSize:16, fontWeight:'700' },
  tileDesc:{ color:'#666', marginTop:4 },
});
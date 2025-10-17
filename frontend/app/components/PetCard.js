import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function PetCard({ pet }){
  return (
    <View style={styles.card}>
      <Image source={{ uri: pet.photo || 'https://placekitten.com/200/200' }} style={styles.img} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.meta}>{pet.species} • {pet.breed || '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:{ flexDirection:'row', gap:12, padding:12, borderRadius:16, backgroundColor:'#fff', alignItems:'center', shadowColor:'#000', shadowOpacity:0.05, shadowRadius:8, elevation:1, marginVertical:6 },
  img:{ width:56, height:56, borderRadius:12, backgroundColor:'#eee' },
  name:{ fontSize:18, fontWeight:'600' },
  meta:{ color:'#666', marginTop:2 },
});
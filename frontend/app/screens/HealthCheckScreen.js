import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

export default function HealthCheckScreen(){
  const [answers, setAnswers] = useState({ eat:null, energy:null, vomit:null, pain:null });
  const setA = (k,v)=> setAnswers(prev => ({ ...prev, [k]: v }));
  const evaluate = ()=>{
    const score = Object.values(answers).reduce((acc, v)=> acc + (v==='yes'?1:0), 0);
    if(score <= 1) Alert.alert('🟢 Tudo bem','Monitore em casa e repita a verificação amanhã.');
    else if(score === 2) Alert.alert('🟡 Atenção','Observe por 24h e considere iniciar o Diário de Recuperação.');
    else Alert.alert('🔴 Procure um veterinário','Os sinais sugerem avaliação presencial.');
  };
  return (
    <ScrollView style={{ flex:1, padding:16 }}>
      <Text style={styles.title}>Desconfio que meu pet não está bem</Text>
      <Text style={{ color:'#666', marginBottom:12 }}>Responda rapidamente às perguntas:</Text>
      <Block q="Ele está comendo normalmente?" onSelect={(v)=> setA('eat', v)} />
      <Block q="Está mais quieto ou apático que o normal?" onSelect={(v)=> setA('energy', v)} />
      <Block q="Houve vômito ou diarreia nas últimas 24h?" onSelect={(v)=> setA('vomit', v)} />
      <Block q="Sinais de dor (mancar, sensibilidade, gemido)?" onSelect={(v)=> setA('pain', v)} />
      <TouchableOpacity style={styles.btn} onPress={evaluate}><Text style={styles.btnText}>Avaliar</Text></TouchableOpacity>
    </ScrollView>
  );
}

function Block({ q, onSelect }){
  return (<View style={styles.block}><Text style={styles.q}>{q}</Text><View style={styles.row}><Chip text="Sim" onPress={()=> onSelect('yes')} /><Chip text="Não" onPress={()=> onSelect('no')} /><Chip text="Um pouco" onPress={()=> onSelect('maybe')} /></View></View>);
}
function Chip({ text, onPress }){ return (<TouchableOpacity onPress={onPress} style={styles.chip}><Text>{text}</Text></TouchableOpacity>); }

const styles = StyleSheet.create({
  title:{ fontSize:20, fontWeight:'700' },
  block:{ backgroundColor:'#fff', borderRadius:16, padding:12, borderWidth:1, borderColor:'#eee', marginBottom:10 },
  q:{ fontWeight:'600', marginBottom:8 },
  row:{ flexDirection:'row', gap:8 },
  chip:{ paddingVertical:10, paddingHorizontal:12, borderRadius:12, borderWidth:1, borderColor:'#ddd', backgroundColor:'#fff' },
  btn:{ backgroundColor:'#2f80ed', padding:16, borderRadius:12, marginTop:16 },
  btnText:{ color:'#fff', textAlign:'center', fontWeight:'700' },
});
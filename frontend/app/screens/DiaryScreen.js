import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ChartView from '../components/ChartView';
import { DiaryAPI, UploadAPI, api } from '../../services/api';
import { registerForPushNotificationsAsync, scheduleDailyReminder } from '../../utils/notifications';

const toScore = (val)=> val==='high'?3: val==='mid'?2: val==='low'?1:0;

export default function DiaryScreen({ route }){
  const { petId } = route.params || {};
  const [apetite, setApetite] = useState(null);
  const [energia, setEnergia] = useState(null);
  const [medicacao, setMedicacao] = useState(false);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [entries, setEntries] = useState([]);

  useEffect(()=>{ (async ()=>{
    await registerForPushNotificationsAsync();
    try{ await scheduleDailyReminder(9, 0, 'Hora do check-in do pet!'); }catch(e){}
  })(); }, []);

  useEffect(()=>{ (async ()=>{
    if(!petId) return;
    try{ const res = await DiaryAPI.getEntries(petId); setEntries(res.data || []); }catch(e){}
  })(); }, [petId]);

  const pickImage = async ()=>{
    const result = await ImagePicker.launchImageLibraryAsync({ quality:0.5 });
    if(!result.canceled){ setPhoto(result.assets[0].uri); }
  };

  const saveEntry = async ()=>{
    if(!apetite || !energia){ Alert.alert('Campos obrigatórios','Selecione apetite e energia.'); return; }
    let uploadedPath=null;
    try{ if(photo){ const up = await UploadAPI.image(photo); uploadedPath = up.data?.path || null; } }catch(e){}
    const payload = { pet_id: petId, date: new Date().toISOString(), appetite: apetite, energy: energia, symptom_photo: uploadedPath, medication: medicacao, notes };
    try{ const res = await DiaryAPI.addEntry(payload); setEntries((prev)=>[...prev, res.data]); }catch(e){ Alert.alert('Erro','Falha ao salvar no servidor.'); return; }
    setApetite(null); setEnergia(null); setMedicacao(false); setNotes(''); setPhoto(null);
    Alert.alert('Salvo','Check-in salvo com sucesso!');
  };

  const chartData = useMemo(()=> entries.map((e, i)=>({ x:i+1, y:(toScore(e.appetite)+toScore(e.energy))/2 })), [entries]);

  const openPdf = ()=>{
    const url = `${api.defaults.baseURL.replace(/\/$/,'')}/api/reports/diary/${petId}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={{ flex:1, padding:16 }}>
      <Text style={styles.title}>Diário de Recuperação</Text>
      <Text style={{ color:'#666', marginBottom:12 }}>Faça check-ins diários para acompanhar a evolução.</Text>

      <Text style={styles.label}>Apetite</Text>
      <View style={styles.row}>
        <Chip text="😋 Comeu bem" active={apetite==='high'} onPress={()=> setApetite('high')} />
        <Chip text="😐 Pouco" active={apetite==='mid'} onPress={()=> setApetite('mid')} />
        <Chip text="😔 Não comeu" active={apetite==='low'} onPress={()=> setApetite('low')} />
      </View>

      <Text style={styles.label}>Energia</Text>
      <View style={styles.row}>
        <Chip text="🐾 Brincando" active={energia==='high'} onPress={()=> setEnergia('high')} />
        <Chip text="😴 Quieto" active={energia==='mid'} onPress={()=> setEnergia('mid')} />
        <Chip text="😣 Apático" active={energia==='low'} onPress={()=> setEnergia('low')} />
      </View>

      <Text style={styles.label}>Medicação</Text>
      <View style={styles.row}><Chip text={medicacao ? '✅ Tomou' : '❌ Esqueceu'} active={true} onPress={()=> setMedicacao(!medicacao)} /></View>

      <TouchableOpacity style={styles.photo} onPress={pickImage}>
        {photo ? <Image source={{ uri: photo }} style={{ width:'100%', height:160, borderRadius:12 }} /> : <Text>📷 Adicionar foto (opcional)</Text>}
      </TouchableOpacity>

      <TextInput style={styles.notes} placeholder="Observações (opcional)" value={notes} onChangeText={setNotes} multiline />

      <TouchableOpacity style={styles.btn} onPress={saveEntry}><Text style={styles.btnText}>Salvar check-in de hoje</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { backgroundColor:'#2f80ed' }]} onPress={openPdf}><Text style={styles.btnText}>Gerar PDF do Relatório</Text></TouchableOpacity>

      {entries.length>0 && (<View style={{ marginTop:16 }}><ChartView data={chartData} /><Text style={{ color:'#666', marginTop:8 }}>Relatório será gerado automaticamente ao final do período.</Text></View>)}
    </ScrollView>
  );
}

function Chip({ text, active, onPress }){
  return (<TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{text}</Text></TouchableOpacity>);
}

const styles = StyleSheet.create({
  title:{ fontSize:20, fontWeight:'700' },
  label:{ marginTop:12, marginBottom:6, fontWeight:'600' },
  row:{ flexDirection:'row', gap:8 },
  chip:{ paddingVertical:10, paddingHorizontal:12, borderRadius:12, borderWidth:1, borderColor:'#ddd', backgroundColor:'#fff' },
  chipActive:{ backgroundColor:'#e8f0fe', borderColor:'#2f80ed' },
  chipText:{ color:'#333' },
  chipTextActive:{ color:'#2f80ed', fontWeight:'700' },
  photo:{ height:160, borderRadius:12, borderWidth:1, borderColor:'#eee', alignItems:'center', justifyContent:'center', marginTop:12, backgroundColor:'#fff' },
  notes:{ backgroundColor:'#fff', padding:12, borderRadius:12, borderWidth:1, borderColor:'#eee', marginTop:12, minHeight:80, textAlignVertical:'top' },
  btn:{ backgroundColor:'#27ae60', padding:16, borderRadius:12, marginTop:16 },
  btnText:{ color:'#fff', textAlign:'center', fontWeight:'700' },
});
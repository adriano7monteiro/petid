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
  const [saving, setSaving] = useState(false);

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
    if(!apetite || !energia){ 
      Alert.alert('Campos obrigatórios','Por favor, selecione o nível de apetite e energia.'); 
      return; 
    }
    
    setSaving(true);
    let uploadedPath=null;
    
    try{ 
      if(photo){ 
        const up = await UploadAPI.image(photo); 
        uploadedPath = up.data?.path || null; 
      } 
    }catch(e){
      console.error('Upload error:', e);
    }
    
    const payload = { 
      pet_id: petId, 
      date: new Date().toISOString(), 
      appetite: apetite, 
      energy: energia, 
      symptom_photo: uploadedPath, 
      medication: medicacao, 
      notes 
    };
    
    try{ 
      const res = await DiaryAPI.addEntry(payload); 
      setEntries((prev)=>[...prev, res.data]); 
      setApetite(null); 
      setEnergia(null); 
      setMedicacao(false); 
      setNotes(''); 
      setPhoto(null);
      Alert.alert('✅ Sucesso','Check-in salvo com sucesso!');
    }catch(e){ 
      Alert.alert('❌ Erro','Falha ao salvar no servidor. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const chartData = useMemo(()=> entries.map((e, i)=>({ x:i+1, y:(toScore(e.appetite)+toScore(e.energy))/2 })), [entries]);

  const openPdf = ()=>{
    const url = `${api.defaults.baseURL.replace(/\/$/,'')}/reports/diary/${petId}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📔 Diário de Recuperação</Text>
        <Text style={styles.subtitle}>Registre o progresso diário do seu pet</Text>
      </View>

      {/* Form Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Check-in de Hoje</Text>
          <Text style={styles.sectionDate}>{new Date().toLocaleDateString('pt-BR')}</Text>
        </View>

        {/* Apetite */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>🍽️ Apetite</Text>
          <View style={styles.chipRow}>
            <Chip 
              text="😋 Comeu bem" 
              active={apetite==='high'} 
              onPress={()=> setApetite('high')}
              color="#10b981"
            />
            <Chip 
              text="😐 Pouco" 
              active={apetite==='mid'} 
              onPress={()=> setApetite('mid')}
              color="#f59e0b"
            />
            <Chip 
              text="😔 Não comeu" 
              active={apetite==='low'} 
              onPress={()=> setApetite('low')}
              color="#ef4444"
            />
          </View>
        </View>

        {/* Energia */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>⚡ Energia</Text>
          <View style={styles.chipRow}>
            <Chip 
              text="🐾 Brincando" 
              active={energia==='high'} 
              onPress={()=> setEnergia('high')}
              color="#10b981"
            />
            <Chip 
              text="😴 Quieto" 
              active={energia==='mid'} 
              onPress={()=> setEnergia('mid')}
              color="#f59e0b"
            />
            <Chip 
              text="😣 Apático" 
              active={energia==='low'} 
              onPress={()=> setEnergia('low')}
              color="#ef4444"
            />
          </View>
        </View>

        {/* Medicação */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>💊 Medicação</Text>
          <TouchableOpacity 
            style={[styles.medicationToggle, medicacao && styles.medicationToggleActive]} 
            onPress={()=> setMedicacao(!medicacao)}
          >
            <Text style={[styles.medicationText, medicacao && styles.medicationTextActive]}>
              {medicacao ? '✅ Medicação administrada' : '❌ Sem medicação hoje'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Foto */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>📷 Foto (opcional)</Text>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📸</Text>
                <Text style={styles.photoText}>Toque para adicionar foto</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Observações */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>📝 Observações (opcional)</Text>
          <TextInput 
            style={styles.notesInput} 
            placeholder="Ex: Brincou mais que ontem, apetite voltando..." 
            value={notes} 
            onChangeText={setNotes} 
            multiline 
            textAlignVertical="top"
          />
        </View>

        {/* Botões */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={saveEntry}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? '⏳ Salvando...' : '✓ Salvar Check-in'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Histórico e Gráfico */}
      {entries.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Evolução</Text>
            <Text style={styles.badge}>{entries.length} registro{entries.length > 1 ? 's' : ''}</Text>
          </View>
          
          <View style={styles.chartContainer}>
            <ChartView data={chartData} />
          </View>
          
          <Text style={styles.chartInfo}>
            Gráfico mostra a evolução do índice de apetite + energia
          </Text>

          <TouchableOpacity style={styles.pdfButton} onPress={openPdf}>
            <Text style={styles.pdfButtonText}>📄 Baixar Relatório em PDF</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📔</Text>
          <Text style={styles.emptyTitle}>Nenhum registro ainda</Text>
          <Text style={styles.emptyText}>
            Faça seu primeiro check-in preenchendo o formulário acima
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function Chip({ text, active, onPress, color }){
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.chip, 
        active && { ...styles.chipActive, borderColor: color, backgroundColor: color + '15' }
      ]}
    >
      <Text style={[styles.chipText, active && { ...styles.chipTextActive, color: color }]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  chipActive: {
    borderWidth: 2,
  },
  chipText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  chipTextActive: {
    fontWeight: '700',
  },
  medicationToggle: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  medicationToggleActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#10b981',
  },
  medicationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  medicationTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  photoButton: {
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  photoText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 100,
    fontSize: 15,
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  chartContainer: {
    marginVertical: 16,
  },
  chartInfo: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  pdfButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 10,
  },
  pdfButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
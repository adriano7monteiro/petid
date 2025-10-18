import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Linking, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import { api, PetsAPI, AIAPI } from '../../services/api';

export default function PetProfile({ route }){
  const { petId } = route.params || {};
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [petImage, setPetImage] = useState(null);
  
  // Vacinas
  const [vaccines, setVaccines] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(false);
  
  // Campos editáveis
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');

  // Calcular idade a partir da data de nascimento
  const calculateAge = (birthdateStr) => {
    if (!birthdateStr) return null;
    
    const birthDate = new Date(birthdateStr);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return `${years} ano${years > 1 ? 's' : ''}${months > 0 ? ` e ${months} ${months > 1 ? 'meses' : 'mês'}` : ''}`;
    } else if (months > 0) {
      return `${months} ${months > 1 ? 'meses' : 'mês'}`;
    } else {
      const days = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
      return `${days} ${days > 1 ? 'dias' : 'dia'}`;
    }
  };

  const age = useMemo(() => calculateAge(birthdate), [birthdate]);

  useEffect(() => {
    loadPetData();
  }, [petId]);

  const loadPetData = async () => {
    try {
      const response = await PetsAPI.listMine();
      const pets = response.data;
      const currentPet = pets.find(p => p.id === petId) || pets[0];
      
      if (currentPet) {
        setPet(currentPet);
        setName(currentPet.name || '');
        setSpecies(currentPet.species || '');
        setBreed(currentPet.breed || '');
        setBirthdate(currentPet.birthdate || '');
        setWeight(currentPet.weight?.toString() || '');
        setAllergies(currentPet.allergies || 'Nenhuma');
        setPetImage(currentPet.photo || null);
        
        // Carregar vacinas salvas
        if (currentPet.vaccines) {
          setVaccines(currentPet.vaccines);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVaccineSuggestions = async () => {
    if (!species) {
      Alert.alert('Atenção', 'Por favor, informe a espécie do pet primeiro.');
      return;
    }
    
    setLoadingVaccines(true);
    try {
      const response = await AIAPI.suggestVaccines({
        pet_species: species,
        pet_breed: breed,
        pet_age: age || ''
      });
      
      // Marcar vacinas já aplicadas
      const suggestedVaccines = response.data.vaccines.map(vaccine => ({
        ...vaccine,
        applied: false,
        id: Date.now() + Math.random()
      }));
      
      setVaccines(suggestedVaccines);
      Alert.alert('Sucesso', `${suggestedVaccines.length} vacinas sugeridas pela IA!`);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      Alert.alert('Erro', 'Não foi possível obter sugestões de vacinas.');
    } finally {
      setLoadingVaccines(false);
    }
  };

  const toggleVaccine = (vaccineId) => {
    setVaccines(vaccines.map(v => 
      v.id === vaccineId ? { ...v, applied: !v.applied } : v
    ));
  };

  const removeVaccine = (vaccineId) => {
    Alert.alert(
      'Remover Vacina',
      'Deseja remover esta vacina da lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => setVaccines(vaccines.filter(v => v.id !== vaccineId))
        }
      ]
    );
  };

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão Necessária', 'É necessário permitir acesso à galeria de fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPetImage(result.assets[0].uri);
      Alert.alert('Sucesso', 'Foto selecionada! Lembre-se de salvar as alterações.');
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão Necessária', 'É necessário permitir acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPetImage(result.assets[0].uri);
      Alert.alert('Sucesso', 'Foto capturada! Lembre-se de salvar as alterações.');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Foto do Pet',
      'Escolha uma opção',
      [
        {
          text: '📷 Tirar Foto',
          onPress: takePhoto,
        },
        {
          text: '🖼️ Escolher da Galeria',
          onPress: pickImageFromGallery,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const cardUrl = useMemo(()=> {
    const baseUrl = api.defaults.baseURL.replace(/\/$/, '');
    return `${baseUrl}/public/pet/${petId || pet?.id || 'pet_demo'}`;
  }, [petId, pet]);
  
  const onOpenCard = ()=> Linking.openURL(cardUrl);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📋 Prontuário do Pet</Text>
        <Text style={styles.subtitle}>Informações detalhadas e carteirinha digital</Text>
      </View>

      {/* Foto do Pet */}
      <View style={styles.photoSection}>
        <View style={styles.photoContainer}>
          {petImage ? (
            <Image source={{ uri: petImage }} style={styles.petPhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderIcon}>🐾</Text>
              <Text style={styles.photoPlaceholderText}>Sem foto</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.photoButton} 
            onPress={showImagePickerOptions}
          >
            <Text style={styles.photoButtonText}>📸 {petImage ? 'Alterar Foto' : 'Adicionar Foto'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Informações Básicas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🐾 Informações Básicas</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nome do Pet</Text>
          <TextInput 
            style={[styles.input, !editing && styles.inputDisabled]} 
            value={name} 
            onChangeText={setName} 
            placeholder="Nome do pet"
            editable={editing}
          />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Espécie</Text>
          <TextInput 
            style={[styles.input, !editing && styles.inputDisabled]} 
            value={species} 
            onChangeText={setSpecies} 
            placeholder="Cão, Gato, etc"
            editable={editing}
          />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Raça</Text>
          <TextInput 
            style={[styles.input, !editing && styles.inputDisabled]} 
            value={breed} 
            onChangeText={setBreed} 
            placeholder="Raça do pet"
            editable={editing}
          />
        </View>
      </View>

      {/* Características Físicas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📊 Características Físicas</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Data de Nascimento</Text>
          <TextInput 
            style={[styles.input, !editing && styles.inputDisabled]} 
            value={birthdate} 
            onChangeText={setBirthdate} 
            placeholder="AAAA-MM-DD (ex: 2020-05-15)"
            editable={editing}
          />
          {age && (
            <View style={styles.ageDisplay}>
              <Text style={styles.ageIcon}>🎂</Text>
              <Text style={styles.ageText}>Idade: {age}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput 
            style={[styles.input, !editing && styles.inputDisabled]} 
            value={weight} 
            onChangeText={setWeight} 
            placeholder="Peso"
            keyboardType="decimal-pad"
            editable={editing}
          />
        </View>
      </View>

      {/* Informações Médicas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💊 Informações Médicas</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Alergias</Text>
          <TextInput 
            style={[styles.input, !editing && styles.inputDisabled, { height: 80 }]} 
            value={allergies} 
            onChangeText={setAllergies} 
            placeholder="Liste as alergias conhecidas"
            multiline
            textAlignVertical="top"
            editable={editing}
          />
        </View>
      </View>

      {/* Botão Editar/Salvar */}
      {editing ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.btn, styles.btnSecondary]} 
            onPress={() => {
              setEditing(false);
              loadPetData(); // Restaurar dados
            }}
          >
            <Text style={styles.btnTextSecondary}>✕ Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btn, styles.btnPrimary]} 
            onPress={() => {
              setEditing(false);
              Alert.alert('Sucesso', 'Dados salvos com sucesso!');
            }}
          >
            <Text style={styles.btnText}>✓ Salvar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.btn, styles.btnEdit]} 
          onPress={() => setEditing(true)}
        >
          <Text style={styles.btnText}>✎ Editar Informações</Text>
        </TouchableOpacity>
      )}

      {/* Carteirinha Digital */}
      <View style={styles.cardSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎫 Carteirinha Digital</Text>
        </View>
        <View style={styles.qrBox}>
          <Text style={styles.qrTitle}>QR Code da Carteirinha</Text>
          <Text style={styles.qrSubtitle}>Escaneie para acesso rápido</Text>
          <View style={styles.qrCodeWrapper}>
            <QRCode value={cardUrl} size={180} />
          </View>
          <TouchableOpacity style={styles.btnCard} onPress={onOpenCard}>
            <Text style={styles.btnCardText}>🌐 Abrir Carteirinha Online</Text>
          </TouchableOpacity>
          <Text style={styles.qrInfo}>
            A carteirinha pode ser acessada sem login, ideal para compartilhar com veterinários
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f7fa' 
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
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
  photoSection: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  photoContainer: {
    alignItems: 'center',
  },
  petPhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f3f4f6',
    borderWidth: 3,
    borderColor: '#8b5cf6',
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f3f4f6',
    borderWidth: 3,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  photoButton: {
    marginTop: 16,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  infoRow: {
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  ageDisplay: {
    marginTop: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  ageIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  ageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803d',
  },
  input: { 
    backgroundColor: '#f9fafb', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#d1d5db',
    fontSize: 15,
    color: '#1f2937',
  },
  inputDisabled: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
  btn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: '#10b981',
  },
  btnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  btnEdit: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginTop: 16,
  },
  btnText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 15,
  },
  btnTextSecondary: {
    color: '#6b7280',
    fontWeight: '700',
    fontSize: 15,
  },
  cardSection: {
    marginTop: 12,
    marginBottom: 20,
  },
  qrBox: { 
    alignItems: 'center', 
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  btnCard: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    marginBottom: 12,
  },
  btnCardText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
  qrInfo: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
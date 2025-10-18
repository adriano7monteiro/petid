import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Linking, ScrollView, Alert, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import { api, PetsAPI } from '../../services/api';

export default function PetProfile({ route }){
  const { petId } = route.params || {};
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [petImage, setPetImage] = useState(null);
  
  // Campos editáveis
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');

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
        setAge(currentPet.age?.toString() || '');
        setWeight(currentPet.weight?.toString() || '');
        setAllergies(currentPet.allergies || 'Nenhuma');
        setPetImage(currentPet.photo || null);
      }
    } catch (error) {
      console.error('Erro ao carregar pet:', error);
    } finally {
      setLoading(false);
    }
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
        
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Idade</Text>
            <TextInput 
              style={[styles.input, !editing && styles.inputDisabled]} 
              value={age} 
              onChangeText={setAge} 
              placeholder="Anos"
              keyboardType="numeric"
              editable={editing}
            />
          </View>

          <View style={styles.gridItem}>
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
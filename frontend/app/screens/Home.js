import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import PetCard from '../components/PetCard';
import AddPetModal from './AddPetModal';
import { PetsAPI } from '../../services/api';

export default function Home({ navigation }){
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadPets = async () => {
    try{
      const res = await PetsAPI.listMine();
      setPets(res.data || []);
    }catch(e){
      Alert.alert('Erro','Falha ao carregar pets. Verifique a API.');
    }finally{ setLoading(false); }
  };

  const handleDeletePet = async (petId) => {
    const petToDelete = pets.find(p => p.id === petId);
    Alert.alert(
      'Remover Pet',
      `Tem certeza que deseja remover ${petToDelete?.name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await PetsAPI.delete(petId);
              Alert.alert('Sucesso', `${petToDelete?.name} foi removido.`);
              loadPets();
            } catch (error) {
              console.error('Erro ao remover pet:', error);
              Alert.alert('Erro', 'Não foi possível remover o pet.');
            }
          }
        }
      ]
    );
  };

  useEffect(()=>{ loadPets(); }, []);

  if(loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Carregando seus pets...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá! 👋</Text>
          <Text style={styles.subtitle}>Bem-vindo ao PetID</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Adicionar Pet</Text>
        </TouchableOpacity>
      </View>

      {/* Pets List */}
      {pets.length > 0 ? (
        <View style={styles.petSection}>
          <Text style={styles.sectionTitle}>
            Meus Pets ({pets.length})
          </Text>
          {pets.map(pet => (
            <PetCard 
              key={pet.id}
              pet={pet} 
              onPress={() => navigation.navigate('Prontuario', { petId: pet.id })}
            />
          ))}
        </View>
      ) : (
        <View style={styles.noPetCard}>
          <Text style={styles.noPetTitle}>🐾 Nenhum pet cadastrado</Text>
          <Text style={styles.noPetText}>Adicione um pet para começar a usar o PetID</Text>
          <TouchableOpacity 
            style={styles.addPetBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addPetBtnText}>+ Adicionar Pet</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions - Only show if there are pets */}
      {pets.length > 0 && pets[0] && (
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          <Text style={styles.actionSubtitle}>
            {pets.length === 1 ? `Para ${pets[0].name}` : 'Selecione um pet acima para acessar'}
          </Text>
        
        <View style={styles.grid}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardPrimary]} 
            onPress={()=> navigation.navigate('Prontuario', { petId: pets[0]?.id }) }
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>📋</Text>
            </View>
            <Text style={styles.actionTitle}>Prontuário</Text>
            <Text style={styles.actionDesc}>Carteirinha digital e histórico completo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardSecondary]} 
            onPress={()=> navigation.navigate('Diario', { petId: pets[0]?.id }) }
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>📔</Text>
            </View>
            <Text style={styles.actionTitle}>Diário</Text>
            <Text style={styles.actionDesc}>Registros de recuperação diários</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardWarning]} 
            onPress={()=> navigation.navigate('Saude', { petId: pets[0]?.id }) }
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>🏥</Text>
            </View>
            <Text style={styles.actionTitle}>Check-up</Text>
            <Text style={styles.actionDesc}>Não está bem? Triagem rápida</Text>
          </TouchableOpacity>
        </View>
      </View>
      )}

      {/* Add Pet Modal */}
      <AddPetModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPetAdded={loadPets}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  addButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  petSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  noPetCard: {
    backgroundColor: '#fff',
    padding: 24,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  noPetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  noPetText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  addPetBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addPetBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  actionsSection: {
    padding: 16,
    marginTop: 12,
  },
  grid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  actionCardSecondary: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  actionCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  actionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  actionDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  statsSection: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 28,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
  },
});
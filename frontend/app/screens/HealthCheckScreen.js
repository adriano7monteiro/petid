import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { AIAPI, PetsAPI } from '../../services/api';

export default function HealthCheckScreen({ route }){
  const { petId } = route.params || {};
  const [answers, setAnswers] = useState({ eat:null, energy:null, vomit:null, pain:null });
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [evaluated, setEvaluated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pet, setPet] = useState(null);
  
  useEffect(() => {
    loadPetData();
  }, [petId]);
  
  const loadPetData = async () => {
    try {
      const response = await PetsAPI.listMine();
      const pets = response.data;
      const currentPet = pets.find(p => p.id === petId) || pets[0];
      setPet(currentPet);
    } catch (error) {
      console.error('Erro ao carregar pet:', error);
    }
  };
  
  const setA = (k,v)=> {
    setAnswers(prev => ({ ...prev, [k]: v }));
    setEvaluated(false);
  };
  
  const evaluate = async ()=>{
    const unanswered = Object.values(answers).filter(v => v === null).length;
    if(unanswered > 0) {
      Alert.alert('⚠️ Atenção', 'Por favor, responda todas as perguntas antes de avaliar.');
      return;
    }
    
    setLoading(true);
    setEvaluated(true);
    
    try {
      // Preparar dados do pet para enviar à IA
      const petName = pet?.name || 'seu pet';
      const petSpecies = pet?.species || 'animal de estimação';
      const petBreed = pet?.breed || '';
      const petAge = pet?.age || '';
      
      // Criar informações adicionais sobre o pet
      let additionalInfoText = '';
      if (petBreed) additionalInfoText += `Raça: ${petBreed}. `;
      if (petAge) additionalInfoText += `Idade: ${petAge} anos. `;
      if (pet?.weight) additionalInfoText += `Peso: ${pet.weight}kg. `;
      if (pet?.allergies && pet.allergies !== 'Nenhuma') {
        additionalInfoText += `Alergias conhecidas: ${pet.allergies}. `;
      }
      
      // Adicionar informações extras do usuário
      if (additionalInfo && additionalInfo.trim()) {
        additionalInfoText += `Observações do tutor: ${additionalInfo.trim()}`;
      }
      
      // Chamar IA para diagnóstico com dados personalizados do pet
      const response = await AIAPI.diagnose({
        eating_normally: answers.eat === 'yes' ? 'yes' : answers.eat === 'no' ? 'no' : 'maybe',
        energy_level: answers.energy,
        vomit_diarrhea: answers.vomit,
        pain_signs: answers.pain,
        pet_name: petName,
        pet_species: petSpecies,
        additional_info: additionalInfoText
      });
      
      setAiDiagnosis(response.data.diagnosis);
      setShowModal(true);
      
    } catch (error) {
      console.error('Erro ao obter diagnóstico:', error);
      
      // Fallback para avaliação manual
      const score = Object.values(answers).reduce((acc, v)=> acc + (v==='yes'?1:0), 0);
      
      if(score <= 1) {
        Alert.alert(
          '🟢 Parece estar tudo bem', 
          `${pet?.name || 'Seu pet'} não apresenta sinais graves. Continue monitorando e repita a verificação amanhã se necessário.`,
          [{ text: 'OK' }]
        );
      } else if(score === 2) {
        Alert.alert(
          '🟡 Atenção recomendada', 
          `Observe ${pet?.name || 'seu pet'} nas próximas 24 horas. Considere iniciar o Diário de Recuperação para acompanhar a evolução.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '🔴 Consulte um veterinário', 
          `Os sinais de ${pet?.name || 'seu pet'} indicam que pode precisar de avaliação profissional. Recomendamos procurar um veterinário o quanto antes.`,
          [{ text: 'Entendi' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };
  
  const reset = () => {
    setAnswers({ eat:null, energy:null, vomit:null, pain:null });
    setAdditionalInfo('');
    setEvaluated(false);
    setAiDiagnosis(null);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏥 Check-up com IA</Text>
        <Text style={styles.subtitle}>
          {pet ? `Avaliação de saúde para ${pet.name}` : 'Avaliação inteligente de saúde'}
        </Text>
      </View>

      {/* Pet Info Card */}
      {pet && (
        <View style={styles.petInfoCard}>
          <Text style={styles.petInfoIcon}>🐾</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.petInfoName}>{pet.name}</Text>
            <Text style={styles.petInfoDetails}>
              {pet.species}{pet.breed ? ` • ${pet.breed}` : ''}{pet.age ? ` • ${pet.age} anos` : ''}
            </Text>
          </View>
        </View>
      )}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>🤖</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Diagnóstico Personalizado com IA</Text>
          <Text style={styles.infoText}>
            {pet ? `A IA analisará os sintomas de ${pet.name} ` : 'A IA analisará os sintomas '}
            considerando suas características específicas para fornecer uma avaliação mais precisa e humanizada.
          </Text>
        </View>
      </View>

      {/* Questions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Como está {pet?.name || 'seu pet'} hoje?
        </Text>
        
        <QuestionBlock 
          number="1"
          question={`${pet?.name || 'Ele'} está comendo normalmente?`}
          answer={answers.eat}
          onSelect={(v)=> setA('eat', v)} 
        />
        
        <QuestionBlock 
          number="2"
          question={`${pet?.name || 'Ele'} está mais quieto ou apático que o normal?`}
          answer={answers.energy}
          onSelect={(v)=> setA('energy', v)} 
        />
        
        <QuestionBlock 
          number="3"
          question="Houve vômito ou diarreia nas últimas 24h?" 
          answer={answers.vomit}
          onSelect={(v)=> setA('vomit', v)} 
        />
        
        <QuestionBlock 
          number="4"
          question="Sinais de dor (mancar, sensibilidade, gemido)?" 
          answer={answers.pain}
          onSelect={(v)=> setA('pain', v)} 
        />
      </View>

      {/* Campo de informações adicionais */}
      <View style={styles.additionalSection}>
        <View style={styles.additionalHeader}>
          <Text style={styles.additionalTitle}>💬 Informações Adicionais (Opcional)</Text>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalText}>Opcional</Text>
          </View>
        </View>
        <Text style={styles.additionalDescription}>
          Descreva qualquer outro sintoma, comportamento ou informação que possa ajudar no diagnóstico
        </Text>
        <TextInput
          style={styles.additionalInput}
          placeholder="Ex: Está bebendo mais água que o normal, teve febre ontem, está tossindo..."
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.characterCount}>
          {additionalInfo.length}/500 caracteres
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.evaluateButton, loading && styles.evaluateButtonDisabled]} 
          onPress={evaluate}
          disabled={loading}
        >
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.evaluateButtonText}>
                Analisando {pet?.name || 'seu pet'}...
              </Text>
            </View>
          ) : (
            <Text style={styles.evaluateButtonText}>
              🤖 Obter Diagnóstico Personalizado
            </Text>
          )}
        </TouchableOpacity>
        
        {evaluated && !loading && (
          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <Text style={styles.resetButtonText}>🔄 Nova Avaliação</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Help Card */}
      <View style={styles.helpCard}>
        <Text style={styles.helpIcon}>💡</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.helpTitle}>Dica importante</Text>
          <Text style={styles.helpText}>
            {pet ? `Se ${pet.name} apresentar` : 'Se seu pet apresentar'} mudanças súbitas no comportamento ou sinais de desconforto intenso, 
            procure um veterinário imediatamente, mesmo que a avaliação da IA indique baixo risco.
          </Text>
        </View>
      </View>

      {/* Modal de Diagnóstico */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>🤖 Diagnóstico para {pet?.name || 'seu pet'}</Text>
                <Text style={styles.modalSubtitle}>Análise personalizada com IA</Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.diagnosisText}>{aiDiagnosis}</Text>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Entendi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function QuestionBlock({ number, question, answer, onSelect }){
  return (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.questionNumber}>
          <Text style={styles.questionNumberText}>{number}</Text>
        </View>
        <Text style={styles.questionText}>{question}</Text>
      </View>
      
      <View style={styles.answerRow}>
        <AnswerChip 
          text="Sim" 
          value="yes"
          selected={answer === 'yes'}
          onPress={()=> onSelect('yes')}
          color="#ef4444"
        />
        <AnswerChip 
          text="Não" 
          value="no"
          selected={answer === 'no'}
          onPress={()=> onSelect('no')}
          color="#10b981"
        />
        <AnswerChip 
          text="Um pouco" 
          value="maybe"
          selected={answer === 'maybe'}
          onPress={()=> onSelect('maybe')}
          color="#f59e0b"
        />
      </View>
    </View>
  );
}

function AnswerChip({ text, value, selected, onPress, color }){
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.answerChip,
        selected && { ...styles.answerChipSelected, borderColor: color, backgroundColor: color + '15' }
      ]}
    >
      <Text style={[styles.answerChipText, selected && { ...styles.answerChipTextSelected, color: color }]}>
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
  petInfoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  petInfoIcon: {
    fontSize: 32,
  },
  petInfoName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  petInfoDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#ede9fe',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c4b5fd',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5b21b6',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6b21a8',
    lineHeight: 18,
  },
  section: {
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  questionNumber: {
    width: 28,
    height: 28,
    backgroundColor: '#8b5cf6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 22,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  answerChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  answerChipSelected: {
    borderWidth: 2,
  },
  answerChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  answerChipTextSelected: {
    fontWeight: '700',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  evaluateButton: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 10,
  },
  evaluateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  evaluateButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resetButtonText: {
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
  helpCard: {
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  helpIcon: {
    fontSize: 24,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  modalClose: {
    fontSize: 28,
    color: '#6b7280',
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  diagnosisText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

export default function HealthCheckScreen(){
  const [answers, setAnswers] = useState({ eat:null, energy:null, vomit:null, pain:null });
  const [evaluated, setEvaluated] = useState(false);
  
  const setA = (k,v)=> {
    setAnswers(prev => ({ ...prev, [k]: v }));
    setEvaluated(false);
  };
  
  const evaluate = ()=>{
    const unanswered = Object.values(answers).filter(v => v === null).length;
    if(unanswered > 0) {
      Alert.alert('⚠️ Atenção', 'Por favor, responda todas as perguntas antes de avaliar.');
      return;
    }
    
    const score = Object.values(answers).reduce((acc, v)=> acc + (v==='yes'?1:0), 0);
    setEvaluated(true);
    
    if(score <= 1) {
      Alert.alert(
        '🟢 Parece estar tudo bem', 
        'Seu pet não apresenta sinais graves. Continue monitorando e repita a verificação amanhã se necessário.',
        [{ text: 'OK' }]
      );
    } else if(score === 2) {
      Alert.alert(
        '🟡 Atenção recomendada', 
        'Observe seu pet nas próximas 24 horas. Considere iniciar o Diário de Recuperação para acompanhar a evolução.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '🔴 Consulte um veterinário', 
        'Os sinais indicam que seu pet pode precisar de avaliação profissional. Recomendamos procurar um veterinário o quanto antes.',
        [{ text: 'Entendi' }]
      );
    }
  };
  
  const reset = () => {
    setAnswers({ eat:null, energy:null, vomit:null, pain:null });
    setEvaluated(false);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏥 Check-up Rápido</Text>
        <Text style={styles.subtitle}>Avalie o estado de saúde do seu pet</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Como funciona?</Text>
          <Text style={styles.infoText}>
            Responda as perguntas abaixo e receba uma orientação sobre o estado do seu pet. 
            Esta ferramenta não substitui uma consulta veterinária.
          </Text>
        </View>
      </View>

      {/* Questions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Responda as perguntas:</Text>
        
        <QuestionBlock 
          number="1"
          question="Ele está comendo normalmente?" 
          answer={answers.eat}
          onSelect={(v)=> setA('eat', v)} 
        />
        
        <QuestionBlock 
          number="2"
          question="Está mais quieto ou apático que o normal?" 
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

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.evaluateButton} onPress={evaluate}>
          <Text style={styles.evaluateButtonText}>🔍 Avaliar Agora</Text>
        </TouchableOpacity>
        
        {evaluated && (
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
            Se você perceber mudanças súbitas no comportamento ou sinais de desconforto intenso, 
            procure um veterinário imediatamente, mesmo que a avaliação indique baixo risco.
          </Text>
        </View>
      </View>
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
  infoCard: {
    backgroundColor: '#dbeafe',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93c5fd',
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
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1e3a8a',
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
    backgroundColor: '#3b82f6',
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
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 10,
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
});
// app/create-ministry.tsx
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../src/config/api';

import PrimaryButton from '../src/components/PrimaryButton';
import StyledInput from '../src/components/StyledInput';

export default function CreateMinistryScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name) {
      Alert.alert('Erro', 'Por favor, dê um nome ao ministério.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/ministries`, { name });
      Alert.alert('Sucesso!', 'Ministério criado.');
      router.back(); // Volta para a Dashboard
    } catch (error) {
      console.error("Erro ao criar ministério:", error);
      Alert.alert('Erro', 'Não foi possível criar o ministério.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>Novo Ministério</Text>
        <StyledInput
          label="Nome do Ministério"
          value={name}
          onChangeText={setName}
        />
        <PrimaryButton onPress={handleCreate} disabled={loading}>
          {loading ? 'Criando...' : 'Criar Ministério'}
        </PrimaryButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1C1C1E' },
    content: { flex: 1, padding: 24, justifyContent: 'center' },
    title: { fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: 'white' },
});
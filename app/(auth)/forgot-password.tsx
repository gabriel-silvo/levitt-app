// app/(auth)/forgot-password.tsx
import axios from 'axios';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../src/config/api.js';

import PrimaryButton from '../../src/components/PrimaryButton';
import StyledInput from '../../src/components/StyledInput';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

    // --- INÍCIO DA NOVA LÓGICA ---
    // 1. Criamos um estado para controlar a visibilidade do teclado
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    // 2. Usamos o useEffect para adicionar e remover os "ouvintes" do teclado
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
            setKeyboardVisible(true); // Teclado apareceu
        }
        );
        const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
            setKeyboardVisible(false); // Teclado escondeu
        }
        );

        // 3. Função de limpeza: remove os "ouvintes" quando o componente é desmontado
        return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
        };
    }, []);
    // --- FIM DA NOVA LÓGICA ---

  const handleSendRequest = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      Alert.alert('Verifique seu E-mail', response.data.message);
      router.back(); // Volta para a tela de login
    } catch (error) {
        console.log(error)
        Alert.alert('Erro', 'Não foi possível completar a solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}
                    scrollEnabled={isKeyboardVisible} // <-- AQUI ESTÁ A MÁGICA
                    showsVerticalScrollIndicator={false} // Opcional: esconde a barra de rolagem
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={theme.colors.onSurface} />
                </TouchableOpacity>
                <View style={styles.content}>
                <Text variant="headlineSmall" style={styles.title}>Redefinir Senha</Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    Insira seu e-mail e enviaremos um link para você voltar a acessar sua conta.
                </Text>
                <StyledInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <PrimaryButton onPress={handleSendRequest} disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </PrimaryButton>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 1 },
  content: { padding: 24 },
  title: { fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { marginBottom: 32, color: '#A0A0A0', textAlign: 'center' },
});
// app/login.tsx
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Nossos novos componentes!
import PrimaryButton from '../../src/components/PrimaryButton';
import StyledInput from '../../src/components/StyledInput';
import GoogleLogo from '../../src/components/icons/GoogleLogo';
import { useAuth } from '../../src/contexts/AuthContext'; // Importa nosso hook

export default function LoginScreen() {
    const { login } = useAuth(); // Pega a função de login do nosso "cérebro"
    const theme = useTheme();
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
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

    const handleLogin = async () => {
        setLoading(true);
        try {
        // Chama a função centralizada
        await login(emailOrUsername, password);
        } catch (error: any) {
        // A lógica de erro permanece na tela
        if (error.response) {
            Alert.alert('Erro no login', error.response.data.error);
        } else {
            Alert.alert('Erro', 'Não foi possível se conectar ao servidor.');
        }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => { /* TODO */ };
    const handleAppleLogin = () => { /* TODO */ };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    scrollEnabled={isKeyboardVisible} // <-- AQUI ESTÁ A MÁGICA
                    showsVerticalScrollIndicator={false} // Opcional: esconde a barra de rolagem
                >
                    <View style={styles.content}>
                        <Text variant="displayMedium" style={styles.logo}>Levitt</Text>
                        <Text variant="headlineSmall" style={styles.title}>Acesse sua conta</Text>
                        
                        <StyledInput label="E-mail ou nome de usuário" value={emailOrUsername} onChangeText={setEmailOrUsername} autoCapitalize="none" />
                        <StyledInput label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
                        
                        <View style={styles.forgotPasswordContainer}>
                        <Link href="/(auth)/forgot-password" asChild>
                            <TouchableOpacity>
                                <Text style={{ color: theme.colors.primary }}>Esqueceu a senha?</Text>
                            </TouchableOpacity>
                        </Link>
                        </View>

                        <PrimaryButton onPress={handleLogin} disabled={loading}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </PrimaryButton>

                        {/* --- Divisor e Botões Sociais --- */}
                        <View style={styles.dividerContainer}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>ou entre com</Text>
                        <View style={styles.line} />
                        </View>

                        <View style={styles.socialButtonsContainer}>
                        <Button mode="outlined" onPress={handleAppleLogin} style={styles.socialButton} labelStyle={styles.socialLabel} icon={() => <Icon name="apple" size={22} color="white" />}>
                            Apple
                        </Button>
                        {/* O ícone do Google agora é nosso componente SVG */}
                        <Button mode="outlined" onPress={handleGoogleLogin} style={styles.socialButton} labelStyle={styles.socialLabel} icon={GoogleLogo}>
                            Google
                        </Button>
                        </View>
                        {/* --- Fim do Divisor --- */}
                        
                        <View style={styles.footer}>
                        <Text>Não tem uma conta? </Text>
                        <Link href="/signup" asChild>
                            <TouchableOpacity>
                            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Registre-se</Text>
                            </TouchableOpacity>
                        </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { textAlign: 'center', fontWeight: 'bold', marginBottom: 96 },
  title: { fontWeight: 'bold', marginBottom: 24 },
  forgotPasswordContainer: { width: '100%', alignItems: 'flex-end', marginBottom: 16, marginTop: -8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#444' },
  dividerText: { marginHorizontal: 10, color: '#A0A0A0' },
  socialButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  socialButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 24,
    paddingVertical: 4,
  },
  socialLabel: { color: 'white' },
});
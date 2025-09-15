// app/signup.tsx
import { Link, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Nossos novos componentes!
import PrimaryButton from '../src/components/PrimaryButton';
import StyledInput from '../src/components/StyledInput';

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();
  // ... (states: fullName, username, etc. - sem alterações)
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const handleRegister = () => {
    // TODO: Implementar a chamada para a API que criamos!
    console.log({ fullName, username, email, password });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text variant="displayMedium" style={styles.logo}>Levitt</Text>
        <Text variant="headlineSmall" style={styles.title}>Crie sua conta</Text>

        {/* Usando nossos componentes reutilizáveis */}
        <StyledInput label="Nome completo" value={fullName} onChangeText={setFullName} />
        <StyledInput label="Nome de usuário" value={username} onChangeText={setUsername} />
        <StyledInput label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <StyledInput label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        <StyledInput label="Confirme a senha" value={repeatPassword} onChangeText={setRepeatPassword} secureTextEntry />

        <PrimaryButton onPress={handleRegister}>
          Cadastrar
        </PrimaryButton>
        
        <View style={styles.footer}>
          <Text>Já tem uma conta? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Entrar</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Estilos foram simplificados pois a maior parte está nos componentes
const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { textAlign: 'center', fontWeight: 'bold', marginBottom: 24 },
  title: { fontWeight: 'bold', marginBottom: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
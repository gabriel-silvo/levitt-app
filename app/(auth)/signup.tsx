// app/signup.tsx
import React, { useEffect, useState } from 'react';
// KeyboardAvoidingView e Platform importados
import { Link, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '../../src/components/PrimaryButton';
import StyledInput from '../../src/components/StyledInput';
import { useAuth } from '../../src/contexts/AuthContext'; // Importa o hook

export default function SignUpScreen() {
  const { register } = useAuth(); // Pega a função de registro do contexto
  const theme = useTheme();
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  //const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
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

  const handleRegister = async () => {
    if (password !== repeatPassword) {
      Alert.alert('Erro', 'As senhas não conferem.');
      return;
    }
    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`;
      // Chama a função centralizada do contexto
      await register({ fullName, username, email, password });
    } catch (error: any) {
      if (error.response) {
        Alert.alert('Erro no cadastro', error.response.data.error);
      } else {
        Alert.alert('Erro', 'Não foi possível se conectar ao servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* O KeyboardAvoidingView agora envolve tudo */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* 4. Passamos o estado para a propriedade scrollEnabled */}
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          scrollEnabled={isKeyboardVisible} // <-- AQUI ESTÁ A MÁGICA
          showsVerticalScrollIndicator={false} // Opcional: esconde a barra de rolagem
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          
          <View style={styles.content}>
            <Text variant="displayMedium" style={styles.logo}>Levitt</Text>
            <Text variant="headlineSmall" style={styles.title}>Crie sua conta</Text>

            <View style={styles.row}>
              <StyledInput
                label="Nome"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.inputHalf} 
              />
              <StyledInput
                label="Sobrenome"
                value={lastName}
                onChangeText={setLastName}
                style={styles.inputHalf}
              />
            </View>
            {/*<StyledInput label="Nome completo" value={fullName} onChangeText={setFullName} />*/}
            <StyledInput label="Nome de usuário" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <StyledInput label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <StyledInput label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
            <StyledInput label="Confirme a Senha" value={repeatPassword} onChangeText={setRepeatPassword} secureTextEntry />

            <PrimaryButton onPress={handleRegister} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos (sem alterações)
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 1 },
  content: { padding: 24 },
  logo: { textAlign: 'center', fontWeight: 'bold', marginBottom: 24 },
  title: { fontWeight: 'bold', marginBottom: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  row: {
    flexDirection: 'row',
    gap: 16, // Cria um espaço de 16px entre os dois inputs
  },
  inputHalf: {
    flex: 1, // Este estilo agora será aplicado sem conflitos
    marginBottom: 16, // Adicionamos a margem aqui para consistência
  },
});
// app/_layout.tsx
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../src/contexts/AuthContext'; // 1. Importamos nosso Provedor
import { theme } from '../src/styles/theme';

export default function RootLayout() {
  return (
    // 2. Envolvemos tudo com o AuthProvider
    <AuthProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Por enquanto, as telas permanecem as mesmas */}
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" /> 
        </Stack>
      </PaperProvider>
    </AuthProvider>
  );
}
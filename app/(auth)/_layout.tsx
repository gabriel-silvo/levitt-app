// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  // Este layout define que as telas de login, cadastro, etc.
  // fazem parte de uma mesma pilha de navegação.
  return <Stack screenOptions={{ headerShown: false }} />;
}
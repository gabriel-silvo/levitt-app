// app/_layout.tsx
import { Slot } from 'expo-router'; // Usamos Slot em vez de Stack aqui
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../src/contexts/AuthContext';
import { theme } from '../src/styles/theme';

export default function RootLayout() {
  // O AuthProvider e o PaperProvider continuam envolvendo todo o app
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        {/* O Slot renderiza o layout filho apropriado (seja de '(auth)' ou '(tabs)') */}
        <Slot />
      </PaperProvider>
    </AuthProvider>
  );
}
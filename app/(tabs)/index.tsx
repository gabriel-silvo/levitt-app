// app/(tabs)/index.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '../../src/components/PrimaryButton';
import { useAuth } from '../../src/contexts/AuthContext'; // Importa nosso hook

export default function HomeScreen() {
  const { logout } = useAuth(); // Pega a função de logout do "cérebro"
  const theme = useTheme();

  const handleLogout = async () => {
    // Simplesmente chama a função centralizada
    await logout();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Bem-vindo ao Levitt!
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Você está logado.
        </Text>

        <PrimaryButton onPress={handleLogout} style={styles.logoutButton}>
          Sair
        </PrimaryButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginVertical: 16,
  },
  logoutButton: {
    marginTop: 32,
    width: '100%',
  },
});
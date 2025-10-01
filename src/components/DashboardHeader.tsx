// src/components/DashboardHeader.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, IconButton, Text } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../styles/theme'; // Adicionei a importação do tema que faltava

export default function DashboardHeader() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileContainer} onPress={() => { /* Navegar para o perfil no futuro */ }}>
        <Avatar.Image
          size={40}
          source={{ uri: user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName}` }}
        />
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Olá,</Text>
          <Text style={styles.userName}>{user?.fullName?.split(' ')[0]}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actionsContainer}>
        <IconButton
          icon="plus-circle-outline"
          iconColor={theme.colors.white}
          size={28}
          onPress={() => router.push('/create-ministry')}
        />
        <IconButton
          containerColor={theme.colors.surface}
          icon="bell-outline"
          iconColor={theme.colors.white}
          size={24}
          onPress={() => { /* Navegar para notificações no futuro */ }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingContainer: {
    marginLeft: 12,
  },
  greetingText: {
    color: theme.colors.reference,
    fontSize: 14,
  },
  userName: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
});
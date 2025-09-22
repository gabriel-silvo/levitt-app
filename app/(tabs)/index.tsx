// app/(tabs)/dashboard.tsx
import DashboardHeader from '@/src/components/DashboardHeader';
import ListItemCard from '@/src/components/ListItemCard';
import PrimaryButton from '@/src/components/PrimaryButton';
import VerseOfTheDayCard from '@/src/components/VerseOfTheDay';
import { theme } from '@/src/styles/theme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';

export default function DashboardScreen() {
  const { logout } = useAuth();
  // Crie um estado para controlar qual tag está ativa
  const [selectedTag, setSelectedTag] = React.useState('Ministérios');

  const handleLogout = async () => {
    // Simplesmente chama a função centralizada
    await logout();
  };

  // Dados de exemplo para as tags
  const filterTags = [
    { name: 'Ministérios', count: 2 },
    { name: 'Escalas', count: 6 },
    { name: 'Ensaios', count: 1 },
    { name: 'Músicas', count: 4 },
  ];

  // Dados de exemplo para a lista
  const ministryData = {
    date: { day: '02', month: 'OUT' },
    time: 'MINISTÉRIO',
    title: 'Vocal',
    description: '3 escalas • 5 músicas',
    members: [
        { uri: 'https://i.pravatar.cc/150?img=1' },
        { uri: 'https://i.pravatar.cc/150?img=2' },
        { uri: 'https://i.pravatar.cc/150?img=3' },
        { uri: 'https://i.pravatar.cc/150?img=4' },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
          <DashboardHeader />
          <VerseOfTheDayCard />

          {/* --- INÍCIO DAS TAGS DE FILTRO --- */}
          <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
              {filterTags.map((tag) => (
                  <Chip
                  key={tag.name}
                  style={[
                      styles.chip,
                      selectedTag === tag.name ? styles.chipSelected : styles.chipUnselected,
                  ]}
                  textStyle={[
                      styles.chipText,
                      selectedTag === tag.name ? styles.chipTextSelected : {},
                  ]}
                  onPress={() => setSelectedTag(tag.name)}
                  >
                  {`${tag.name} (${tag.count})`}
                  </Chip>
              ))}
              </ScrollView>
          </View>
          {/* --- FIM DAS TAGS DE FILTRO --- */}

          {/* --- INÍCIO DA LISTA DINÂMICA --- */}
          <View style={styles.listContainer}>
              <ListItemCard {...ministryData} />
              {/* Adicionar mais cards aqui */}
          </View>
          {/* --- FIM DA LISTA DINÂMICA --- */}

          <PrimaryButton onPress={handleLogout} style={styles.logoutButton}>
            Sair
          </PrimaryButton>

          <Text variant="headlineLarge">Dashboard</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary, // Fundo escuro padrão
  },
  scrollContainer: {
    padding: 16,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  chip: {
    marginRight: 8,
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: '#BF5AF2', // Cor primária roxa
  },
  chipUnselected: {
    backgroundColor: '#3A3A3C', // Cinza escuro
  },
  chipText: {
    color: '#FFFFFF',
  },
  chipTextSelected: {
    fontWeight: 'bold',
  },
  listContainer: {
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 32,
    width: '100%',
  },
});
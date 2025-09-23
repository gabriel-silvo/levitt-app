// app/(tabs)/dashboard.tsx
import DashboardHeader from '@/src/components/DashboardHeader';
import ListItemCard from '@/src/components/ListItemCard';
import VerseOfTheDayCard from '@/src/components/VerseOfTheDay';
import { theme } from '@/src/styles/theme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';
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
    time: '19H30',
    title: 'Ministério',
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
          <Text variant="titleLarge" style={styles.dashboardTitle}>Dashboard</Text>
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
                  // A MUDANÇA ESTÁ AQUI
                  textStyle={[
                    styles.chipText, // Estilo base
                    selectedTag === tag.name ? styles.chipTextSelected : {}, // Estilo quando selecionado
                  ]}
                  onPress={() => setSelectedTag(tag.name)}
                >
                  {`${tag.count.toString().padStart(2, '0')} ${tag.name}`}
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

          <Button mode="outlined" onPress={handleLogout} labelStyle={styles.buttonText} style={styles.logoutButton}>
            Sair
          </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function hexToRgba(hex: string, opacity: number): string {
  // Remove the '#' if present
  const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;

  // Parse R, G, B values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Return RGBA string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Fundo escuro padrão
  },
  scrollContainer: {
    padding: 16,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  buttonText: {
    color: theme.colors.white
  },
  chip: {
    marginRight: 8,
    borderRadius: 20,
    // Removemos o backgroundColor daqui para controlar nos estilos abaixo
  },
  chipSelected: {
    backgroundColor: hexToRgba(theme.colors.primary, 0.1), // Roxo transparente
    borderWidth: 1,
    borderColor: theme.colors.primary, // Borda sutil
  },
  chipUnselected: {
    backgroundColor: 'transparent', // Fundo transparente
    borderWidth: 1,
    borderColor: theme.colors.outline, // Borda sutil
  },
  chipText: {
    // Cor padrão do texto (para chips não selecionados)
    color: theme.colors.reference,
  },
  chipTextSelected: {
    // Estilos para o texto do chip selecionado
    color: theme.colors.white, // Texto branco, como você sugeriu
    fontWeight: 'bold',
  },
  dashboardTitle: {
    color: theme.colors.reference, // Usando nosso cinza mais claro
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 32,
    width: '100%',
  },
});
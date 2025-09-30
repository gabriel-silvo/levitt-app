// app/(tabs)/index.tsx
import DashboardHeader from '@/src/components/DashboardHeader';
import ListItemCard from '@/src/components/ListItemCard';
import VerseOfTheDayCard from '@/src/components/VerseOfTheDay';
import { theme } from '@/src/styles/theme';
import axios from 'axios'; // Garanta que axios está importado
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../src/config/api'; // Garanta que a API_URL está importada
import { useAuth } from '../../src/contexts/AuthContext';

// Definimos a "forma" de um objeto de ministério
interface Ministry {
  id: string;
  name: string;
  memberCount: number;
  songCount: number;
  scaleCount: number;
}

export default function DashboardScreen() {
  // Pegamos TUDO do contexto. A tela não busca mais nada.
  const { logout, dailyVerse, loading } = useAuth();
  const [selectedTag, setSelectedTag] = React.useState('Ministérios');
  const [stats, setStats] = useState({
    ministries: 0,
    scales: 0,
    rehearsals: 0,
    songs: 0,
  }); // Criamos um estado para guardar as estatísticas
  // Criamos um estado para guardar a lista de ministérios
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Atualizamos o useEffect para buscar as estatísticas E a lista inicial
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingList(true);
      try {
        // Buscamos os stats (como antes)
        const statsResponse = await axios.get(`${API_URL}/dashboard-stats`);
        setStats(statsResponse.data);

        // Buscamos a lista de ministérios (a tag padrão)
        const ministriesResponse = await axios.get(`${API_URL}/ministries`);
        setMinistries(ministriesResponse.data);

      } catch (error) {
        console.error("Erro ao buscar dados da dashboard:", error);
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchData();
  }, []);

  // Tornamos os dados das tags dinâmicos
  const filterTags = [
    { name: 'Ministérios', count: stats.ministries },
    { name: 'Escalas', count: stats.scales },
    { name: 'Ensaios', count: stats.rehearsals },
    { name: 'Músicas', count: stats.songs },
  ];

  const handleLogout = async () => {
    // Simplesmente chama a função centralizada
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <DashboardHeader />
        <Text variant="titleLarge" style={styles.dashboardTitle}>Dashboard</Text>
        {/* O Card agora recebe os dados diretamente do contexto */}
        <VerseOfTheDayCard 
          verse={dailyVerse?.verseText || ''}
          reference={dailyVerse?.verseReference || ''}
          version={dailyVerse?.version || ''}
          loading={loading} // Usamos o estado de loading principal do app
        />

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
                {`${tag.count > 0 ? tag.count.toString().padStart(2, '0') + ' ' : ''}${tag.name}`}
              </Chip>
            ))}
            </ScrollView>
        </View>
        {/* --- FIM DAS TAGS DE FILTRO --- */}

        {/* --- INÍCIO DA LISTA DINÂMICA --- */}
        <View style={styles.listContainer}>
          {/* Se a tag 'Ministérios' estiver selecionada, renderiza a lista */}
          {selectedTag === 'Ministérios' && (
            <>
              {ministries.map((ministry) => (
                <ListItemCard
                  key={ministry.id}
                  date={{ day: ministry.memberCount.toString(), month: 'Membros' }}
                  time={`${ministry.songCount} Músicas`}
                  title={ministry.name}
                  description={`${ministry.scaleCount} escalas futuras`}
                  // members e stats podem ser omitidos ou adaptados
                />
              ))}
            </>
          )}
          {/* No futuro, adicionaremos 'else if' para as outras tags aqui */}
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
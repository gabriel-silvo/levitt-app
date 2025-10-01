// app/(tabs)/index.tsx
import DashboardHeader from '@/src/components/DashboardHeader';
import ListItemCard from '@/src/components/ListItemCard';
import VerseOfTheDayCard from '@/src/components/VerseOfTheDay';
import { theme } from '@/src/styles/theme';
import axios from 'axios'; // Garanta que axios está importado
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../src/config/api'; // Garanta que a API_URL está importada
import { useAuth } from '../../src/contexts/AuthContext';

interface Ministry {
  id: string;
  name: string;
  imageUrl?: string | null;
  songCount: number;
  scaleCount: number;
  members: { uri: string }[];
}

export default function DashboardScreen() {
  // Pegamos TUDO do contexto. A tela não busca mais nada.
  const { logout } = useAuth();
  // --- LÓGICA DO VERSÍCULO VOLTA PARA CÁ ---
  const [verseData, setVerseData] = useState({ verseText: '', verseReference: '', version: '' });
  const [verseLoading, setVerseLoading] = useState(true);
  // Criamos um estado para guardar as estatísticas
  const [selectedTag, setSelectedTag] = React.useState('Ministério');
  const [stats, setStats] = useState({
    ministries: 0,
    scales: 0,
    rehearsals: 0,
    songs: 0,
  });
  // Criamos um estado para guardar a lista de ministérios
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const response = await axios.get(`${API_URL}/verse-of-the-day`);
        setVerseData(response.data);
      } catch (error) {
        console.error("Falha ao buscar versículo:", error);
        setVerseData({
          verseText: "O Senhor é o meu pastor; nada me faltará.",
          verseReference: "Salmos 23:1",
          version: "NVI"
        });
      } finally {
        setVerseLoading(false);
      }
    };
    fetchVerse();
  }, []);

  // Atualizamos o useEffect para buscar as estatísticas E a lista inicial
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoadingList(true);
        try {
          // A lógica de busca de dados é a mesma de antes
          const statsResponse = await axios.get(`${API_URL}/dashboard-stats`);
          setStats(statsResponse.data);

          const ministriesResponse = await axios.get(`${API_URL}/ministries`);
          setMinistries(ministriesResponse.data);

        } catch (error) {
          console.error("Erro ao buscar dados da dashboard:", error);
        } finally {
          setIsLoadingList(false);
        }
      };

      fetchData();

      return () => {
        // Função de limpeza opcional, se necessário
      };
    }, []) // O array de dependências vazio garante que a lógica não se repita desnecessariamente
  );

  // Tornamos os dados das tags dinâmicos
  const filterTags = [
    { name: 'Ministério', count: stats.ministries },
    { name: 'Escala', count: stats.scales },
    { name: 'Ensaio', count: stats.rehearsals },
    { name: 'Música', count: stats.songs },
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
          verse={verseData.verseText}
          reference={verseData.verseReference}
          version={verseData.version}
          loading={verseLoading} // Usa o estado de loading local
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
                {`${tag.count > 0 ? tag.count.toString().padStart(2, '0') + ' ' : ''}${tag.name}${tag.count != 1 ? 's' : ''}`}
              </Chip>
            ))}
            </ScrollView>
        </View>
        {/* --- FIM DAS TAGS DE FILTRO --- */}

        {/* --- INÍCIO DA LISTA DINÂMICA --- */}
        <View style={styles.listContainer}>
          {/* Se a tag 'Ministérios' estiver selecionada, renderiza a lista */}
          {selectedTag === 'Ministério' && (
            <>
              {ministries.map((ministry) => (
                <ListItemCard
                  key={ministry.id}
                  // --- A MUDANÇA ESTÁ AQUI ---
                  // Passamos a URL da imagem e a lista de membros
                  imageUrl={ministry.imageUrl || `https://ui-avatars.com/api/?name=${ministry.name}&background=6A35F4&color=fff`}
                  title={ministry.name}
                  description={`${ministry.scaleCount} escalas • ${ministry.songCount} músicas`}
                  members={ministry.members}
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
    paddingVertical: 4,
    borderRadius: 24,
  },
});
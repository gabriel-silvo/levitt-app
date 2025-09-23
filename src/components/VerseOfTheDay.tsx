// src/components/VerseOfTheDayCard.tsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { API_URL } from '../config/api'; // Usamos nossa URL centralizada
import { theme } from '../styles/theme';

export default function VerseOfTheDayCard() {
  const [verse, setVerse] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVerse() {
      try {
        // 1. Faz a chamada para a nossa nova rota no backend
        const response = await axios.get(`${API_URL}/verse-of-the-day`);
        // 2. Salva os dados no estado do componente
        setVerse(response.data.verseText);
        setReference(response.data.verseReference);
      } catch (error) {
        console.error("Falha ao buscar versículo:", error);
        // 3. Se falhar, define um versículo padrão
        setVerse("O Senhor é o meu pastor; nada me faltará.");
        setReference("Salmos 23:1");
      } finally {
        setLoading(false);
      }
    }

    fetchVerse();
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  return (
    <Card style={styles.card}>
      <Card.Content>
        {loading ? (
          // Mostra um indicador de carregamento enquanto busca o versículo
          <ActivityIndicator animating={true} color={theme.colors.primary} />
        ) : (
          <>
            <Text style={styles.verseText}>&#34;{verse}&#34;</Text>
            <Text style={styles.referenceText}>{reference}</Text>
          </>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
    // Seus estilos existentes podem permanecer aqui
    card: { /* ... */ },
    verseText: { /* ... */ },
    referenceText: { /* ... */ },
});
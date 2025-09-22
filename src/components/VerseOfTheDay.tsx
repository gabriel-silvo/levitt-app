// src/components/VerseOfTheDayCard.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function VerseOfTheDayCard() {
  // No futuro, podemos buscar um versículo real de uma API
  const verse = "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.";
  const reference = "Salmos 119:105";

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.verseText}>
            &#34;{verse}&#34;
        </Text>
        <Text style={styles.referenceText}>{reference}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2C2C2E', // Um cinza um pouco mais claro que o fundo
    marginBottom: 24,
  },
  verseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  referenceText: {
    color: '#A0A0A0',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
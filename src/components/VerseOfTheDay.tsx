// src/components/VerseOfTheDayCard.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { theme } from '../styles/theme';

// O componente agora espera receber os dados como propriedades
type Props = {
  verse: string;
  reference: string;
  version: string;
  loading: boolean;
};

export default function VerseOfTheDayCard({ verse, reference, version, loading }: Props) {
  // Nenhuma lógica de busca de dados aqui. Apenas renderização.
  return (
    <Card style={styles.card}>
      <Card.Content>
        {loading ? (
          <ActivityIndicator animating={true} color={theme.colors.primary} />
        ) : (
          <>
            <Text style={styles.verseText}>{verse}</Text>
            <Text style={styles.referenceText}>{reference} ({version})</Text>
          </>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: 24,
    //backgroundColor: theme.colors.background, // Fundo transparente
    borderWidth: 1,
    borderColor: theme.colors.outline, // Borda sutil
  },
  verseText: {
    color: theme.colors.white,
    fontSize: 14,
    //fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  referenceText: {
    color: theme.colors.reference,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
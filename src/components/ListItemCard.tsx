// src/components/ListItemCard.tsx
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../styles/theme';

type ListItemCardProps = {
  title: string;
  description?: string;
  // Propriedades antigas de data/hora se tornam opcionais
  date?: { day: string; month: string };
  time?: string;
  // Nova propriedade para a imagem
  imageUrl?: string;
  members?: { uri: string }[];
  stats?: { confirmed: number; declined: number; pending: number };
};

export default function ListItemCard({ date, time, title, description, imageUrl, members, stats }: ListItemCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        {/* --- LÓGICA DE EXIBIÇÃO: IMAGEM OU DATA --- */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.ministryImage} />
        ) : date && time && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateDay}>{date.day}</Text>
            <Text style={styles.dateMonth}>{date.month}</Text>
            <Text style={styles.dateTime}>{time}</Text>
          </View>
        )}
        {/* --- FIM DA LÓGICA --- */}
        
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          <View style={styles.bottomRow}>
            {/* --- LÓGICA DOS AVATARES SOBREPOSTOS --- */}
            {members && (
              <View style={styles.avatarContainer}>
                {members.slice(0, 4).map((member, index) => ( // Limite de 4 avatares
                  <Avatar.Image
                    key={index}
                    size={24}
                    source={{ uri: member.uri }}
                    style={[
                      styles.avatar,
                      { marginLeft: index > 0 ? -8 : 0, zIndex: members.length - index } // Margem negativa e zIndex (era -8)
                    ]}
                  />
                ))}
              </View>
            )}
            {/* --- FIM DA LÓGICA --- */}
            {stats && (
              <View style={styles.statsContainer}>
                <Icon name="thumb-up" size={14} color={theme.colors.success} />
                <Text style={styles.statText}>{stats.confirmed}</Text>
                <Icon name="thumb-down" size={14} color={theme.colors.error} />
                <Text style={styles.statText}>{stats.declined}</Text>
                <Icon name="clock-outline" size={14} color={theme.colors.warning} />
                <Text style={styles.statText}>{stats.pending}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.bottomBorder} />
    </Card>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.outline, // Borda sutil
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  dateDay: { color: theme.colors.white, fontSize: 24, fontWeight: 'bold' },
  dateMonth: { color: theme.colors.reference, fontSize: 12, textTransform: 'uppercase' },
  dateTime: { color: theme.colors.reference, fontSize: 12, marginTop: 4 },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: { color: theme.colors.white, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  description: { color: theme.colors.reference, fontSize: 14, marginBottom: 12 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ministryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2, // era (2.0)
    borderColor: theme.colors.surface
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: theme.colors.reference,
    marginLeft: 4,
    marginRight: 12,
    fontSize: 12,
  },
  bottomBorder: {
    height: 3,
    backgroundColor: theme.colors.primary, // Roxo
  },
});
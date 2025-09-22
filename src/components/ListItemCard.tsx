// src/components/ListItemCard.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type ListItemCardProps = {
  date: { day: string; month: string };
  time: string;
  title: string;
  description?: string;
  members?: { uri: string }[];
  stats?: { confirmed: number; declined: number; pending: number };
};

export default function ListItemCard({ date, time, title, description, members, stats }: ListItemCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateDay}>{date.day}</Text>
          <Text style={styles.dateMonth}>{date.month}</Text>
          <Text style={styles.dateTime}>{time}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          <View style={styles.bottomRow}>
            {members && (
              <View style={styles.avatarContainer}>
                {members.slice(0, 4).map((member, index) => (
                  <Avatar.Image
                    key={index}
                    size={24}
                    source={{ uri: member.uri }}
                    style={[styles.avatar, { marginLeft: index > 0 ? -8 : 0 }]}
                  />
                ))}
              </View>
            )}
            {stats && (
              <View style={styles.statsContainer}>
                <Icon name="thumb-up" size={14} color="#34C759" />
                <Text style={styles.statText}>{stats.confirmed}</Text>
                <Icon name="thumb-down" size={14} color="#FF3B30" />
                <Text style={styles.statText}>{stats.declined}</Text>
                <Icon name="clock-outline" size={14} color="#FF9500" />
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
    backgroundColor: '#2C2C2E',
    marginBottom: 12,
    overflow: 'hidden',
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
  dateDay: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  dateMonth: { color: '#A0A0A0', fontSize: 12, textTransform: 'uppercase' },
  dateTime: { color: '#A0A0A0', fontSize: 12, marginTop: 4 },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  description: { color: '#A0A0A0', fontSize: 14, marginBottom: 12 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
  },
  avatar: {
    borderWidth: 1.5,
    borderColor: '#1C1C1E',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#A0A0A0',
    marginLeft: 4,
    marginRight: 12,
    fontSize: 12,
  },
  bottomBorder: {
    height: 3,
    backgroundColor: '#BF5AF2', // Roxo
  },
});
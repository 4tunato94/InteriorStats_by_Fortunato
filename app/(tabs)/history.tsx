import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Calendar, Clock, Users, ChartBar as BarChart3, ChevronRight } from 'lucide-react-native';

interface Match {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  duration: string;
  eventsCount: number;
  status: 'completed' | 'in_progress';
}

export default function HistoryScreen() {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const [matches, setMatches] = useState<Match[]>([
    {
      id: '1',
      date: '2024-01-15',
      homeTeam: 'Santos FC',
      awayTeam: 'São Paulo FC',
      duration: '90:00',
      eventsCount: 45,
      status: 'completed',
    },
    {
      id: '2',
      date: '2024-01-12',
      homeTeam: 'Corinthians',
      awayTeam: 'Palmeiras',
      duration: '87:32',
      eventsCount: 38,
      status: 'completed',
    },
    {
      id: '3',
      date: '2024-01-10',
      homeTeam: 'Flamengo',
      awayTeam: 'Fluminense',
      duration: '92:15',
      eventsCount: 52,
      status: 'completed',
    },
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? '#4CAF50' : '#FF9800';
  };

  const getStatusLabel = (status: string) => {
    return status === 'completed' ? 'Concluída' : 'Em andamento';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Análises</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <BarChart3 size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{matches.length}</Text>
          <Text style={styles.statLabel}>Partidas</Text>
        </View>
        
        <View style={styles.statCard}>
          <Clock size={24} color="#2196F3" />
          <Text style={styles.statNumber}>
            {matches.reduce((total, match) => {
              const [minutes] = match.duration.split(':');
              return total + parseInt(minutes);
            }, 0)}m
          </Text>
          <Text style={styles.statLabel}>Tempo Total</Text>
        </View>
        
        <View style={styles.statCard}>
          <Users size={24} color="#FF9800" />
          <Text style={styles.statNumber}>
            {matches.reduce((total, match) => total + match.eventsCount, 0)}
          </Text>
          <Text style={styles.statLabel}>Eventos</Text>
        </View>
      </View>

      <ScrollView style={styles.matchesList}>
        <Text style={styles.sectionTitle}>Partidas Recentes</Text>
        
        {matches.map((match) => (
          <TouchableOpacity key={match.id} style={styles.matchItem}>
            <View style={styles.matchHeader}>
              <View style={styles.matchDate}>
                <Calendar size={16} color="#888" />
                <Text style={styles.dateText}>{formatDate(match.date)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(match.status)}</Text>
              </View>
            </View>

            <View style={styles.matchTeams}>
              <Text style={styles.teamName}>{match.homeTeam}</Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={styles.teamName}>{match.awayTeam}</Text>
            </View>

            <View style={styles.matchStats}>
              <View style={styles.statItem}>
                <Clock size={14} color="#888" />
                <Text style={styles.statText}>{match.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <BarChart3 size={14} color="#888" />
                <Text style={styles.statText}>{match.eventsCount} eventos</Text>
              </View>
              <ChevronRight size={16} color="#888" />
            </View>
          </TouchableOpacity>
        ))}

        {matches.length === 0 && (
          <View style={styles.emptyState}>
            <BarChart3 size={48} color="#555" />
            <Text style={styles.emptyTitle}>Nenhuma análise encontrada</Text>
            <Text style={styles.emptyDescription}>
              Suas análises de partidas aparecerão aqui
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  matchesList: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  matchItem: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  vs: {
    fontSize: 14,
    color: '#888',
    marginHorizontal: 15,
  },
  matchStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});
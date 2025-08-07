import React, { useState } from 'react';
import { Calendar, Clock, Users, BarChart3, ChevronRight } from 'lucide-react';

interface Match {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  duration: string;
  eventsCount: number;
  status: 'completed' | 'in_progress';
}

const HistoryPage: React.FC = () => {
  const [matches] = useState<Match[]>([
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Histórico de Análises</h1>
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <BarChart3 size={24} color="#4CAF50" />
          <p style={styles.statNumber}>{matches.length}</p>
          <p style={styles.statLabel}>Partidas</p>
        </div>
        
        <div style={styles.statCard}>
          <Clock size={24} color="#2196F3" />
          <p style={styles.statNumber}>
            {matches.reduce((total, match) => {
              const [minutes] = match.duration.split(':');
              return total + parseInt(minutes);
            }, 0)}m
          </p>
          <p style={styles.statLabel}>Tempo Total</p>
        </div>
        
        <div style={styles.statCard}>
          <Users size={24} color="#FF9800" />
          <p style={styles.statNumber}>
            {matches.reduce((total, match) => total + match.eventsCount, 0)}
          </p>
          <p style={styles.statLabel}>Eventos</p>
        </div>
      </div>

      <div style={styles.matchesList}>
        <h2 style={styles.sectionTitle}>Partidas Recentes</h2>
        
        {matches.map((match) => (
          <div key={match.id} style={styles.matchItem}>
            <div style={styles.matchHeader}>
              <div style={styles.matchDate}>
                <Calendar size={16} color="#888" />
                <span style={styles.dateText}>{formatDate(match.date)}</span>
              </div>
              <div style={{ ...styles.statusBadge, backgroundColor: getStatusColor(match.status) }}>
                <span style={styles.statusText}>{getStatusLabel(match.status)}</span>
              </div>
            </div>

            <div style={styles.matchTeams}>
              <span style={styles.teamName}>{match.homeTeam}</span>
              <span style={styles.vs}>vs</span>
              <span style={styles.teamName}>{match.awayTeam}</span>
            </div>

            <div style={styles.matchStats}>
              <div style={styles.statItem}>
                <Clock size={14} color="#888" />
                <span style={styles.statText}>{match.duration}</span>
              </div>
              <div style={styles.statItem}>
                <BarChart3 size={14} color="#888" />
                <span style={styles.statText}>{match.eventsCount} eventos</span>
              </div>
              <ChevronRight size={16} color="#888" />
            </div>
          </div>
        ))}

        {matches.length === 0 && (
          <div style={styles.emptyState}>
            <BarChart3 size={48} color="#555" />
            <p style={styles.emptyTitle}>Nenhuma análise encontrada</p>
            <p style={styles.emptyDescription}>
              Suas análises de partidas aparecerão aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#121212',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #333',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsContainer: {
    display: 'flex',
    padding: '20px',
    gap: '15px',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    border: '1px solid #333',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: '8px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
  matchesList: {
    flex: 1,
    padding: '20px 40px',
    overflow: 'auto',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '15px',
  },
  matchItem: {
    backgroundColor: '#1e1e1e',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '15px',
    border: '1px solid #333',
    cursor: 'pointer',
  },
  matchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  matchDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dateText: {
    fontSize: '14px',
    color: '#888',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
  },
  statusText: {
    fontSize: '12px',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  matchTeams: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px',
  },
  teamName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  vs: {
    fontSize: '14px',
    color: '#888',
    margin: '0 15px',
  },
  matchStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statText: {
    fontSize: '14px',
    color: '#888',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '60px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: '20px',
  },
  emptyDescription: {
    fontSize: '14px',
    color: '#888',
    marginTop: '8px',
    textAlign: 'center' as const,
  },
};

export default HistoryPage;
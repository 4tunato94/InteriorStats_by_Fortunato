import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Play } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Dimensions } from 'react-native';

interface Team {
  id: string;
  name: string;
  logo: string; 
  primaryColor: string;
  secondaryColor: string;
  players: Player[];
}

interface Player {
  id: string;
  number: string;
  name: string;
  position: string;
  role: 'titular' | 'reserva';
}

export default function AnalysisSetup() {
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Load teams when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadTeams();
    }, [])
  );

  const loadTeams = async () => {
    try {
      const storedTeams = await AsyncStorage.getItem('teams');
      if (storedTeams) {
        setTeams(JSON.parse(storedTeams));
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const selectHomeTeam = (team: Team) => { 
    setHomeTeam(team);
    // Clear away team if same team is selected
    if (awayTeam?.id === team.id) {
      setAwayTeam(null);
    }
  };

  const selectAwayTeam = (team: Team) => {
    setAwayTeam(team);
    // Clear home team if same team is selected
    if (homeTeam?.id === team.id) {
      setHomeTeam(null);
    }
  };

  const startAnalysis = () => {
    if (!homeTeam || !awayTeam) {
      Alert.alert('Erro', 'Selecione ambos os times para iniciar a análise');
      return;
    }
    
    if (homeTeam.id === awayTeam.id) {
      Alert.alert('Erro', 'Selecione times diferentes');
      return;
    }

    router.push({
      pathname: '/analysis',
      params: {
        homeTeam: JSON.stringify(homeTeam),
        awayTeam: JSON.stringify(awayTeam),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>InteriorStats</Text>
        <Text style={styles.subtitle}>by Fortunato</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Configurar Análise</Text>
        
        {teams.length === 0 ? (
          <View style={styles.noTeamsContainer}>
            <Text style={styles.noTeamsText}>Nenhum time cadastrado</Text>
            <Text style={styles.noTeamsSubtext}>
              Vá para a aba "Times" para cadastrar seus times primeiro
            </Text>
          </View>
        ) : (
          <>
            {/* Home Team Selection */}
            <View style={styles.teamSelectionSection}>
              <Text style={styles.teamLabel}>Time da Casa</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.teamsScroll}
                contentContainerStyle={styles.teamsScrollContent}
              >
                {teams.map((team) => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamOption,
                      homeTeam?.id === team.id && styles.selectedTeamOption,
                      awayTeam?.id === team.id && styles.disabledTeamOption,
                    ]}
                    onPress={() => selectHomeTeam(team)}
                    disabled={awayTeam?.id === team.id}
                  >
                    <Image source={{ uri: team.logo }} style={styles.teamOptionLogo} />
                    <Text style={[
                      styles.teamOptionName,
                      homeTeam?.id === team.id && styles.selectedTeamName,
                      awayTeam?.id === team.id && styles.disabledTeamName,
                    ]}>
                      {team.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Away Team Selection */}
            <View style={styles.teamSelectionSection}>
              <Text style={styles.teamLabel}>Time Visitante</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.teamsScroll}
                contentContainerStyle={styles.teamsScrollContent}
              >
                {teams.map((team) => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamOption,
                      awayTeam?.id === team.id && styles.selectedTeamOption,
                      homeTeam?.id === team.id && styles.disabledTeamOption,
                    ]}
                    onPress={() => selectAwayTeam(team)}
                    disabled={homeTeam?.id === team.id}
                  >
                    <Image source={{ uri: team.logo }} style={styles.teamOptionLogo} />
                    <Text style={[
                      styles.teamOptionName,
                      awayTeam?.id === team.id && styles.selectedTeamName,
                      homeTeam?.id === team.id && styles.disabledTeamName,
                    ]}>
                      {team.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Selected Teams Display */}
            {(homeTeam || awayTeam) && (
              <View style={styles.selectedTeamsContainer}>
                <View style={styles.selectedTeamCard}>
                  {homeTeam ? (
                    <>
                      <Image source={{ uri: homeTeam.logo }} style={styles.selectedTeamLogo} />
                      <Text style={styles.selectedTeamLabel}>Casa</Text>
                      <Text style={styles.selectedTeamName}>{homeTeam.name}</Text>
                    </>
                  ) : (
                    <Text style={styles.placeholderText}>Time da Casa</Text>
                  )}
                </View>
                
                <Text style={styles.vsText}>VS</Text>
                
                <View style={styles.selectedTeamCard}>
                  {awayTeam ? (
                    <>
                      <Image source={{ uri: awayTeam.logo }} style={styles.selectedTeamLogo} />
                      <Text style={styles.selectedTeamLabel}>Visitante</Text>
                      <Text style={styles.selectedTeamName}>{awayTeam.name}</Text>
                    </>
                  ) : (
                    <Text style={styles.placeholderText}>Time Visitante</Text>
                  )}
                </View>
              </View>
            )}
          </>
        )}

        {homeTeam && awayTeam && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startAnalysis}
          >
            <Play size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Iniciar Análise</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 60,
  },
  contentContainer: {
    paddingVertical: 20,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
    minHeight: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  noTeamsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noTeamsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  noTeamsSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  teamSelectionSection: {
    marginBottom: 30,
  },
  teamLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  teamsScroll: {
    maxHeight: 120,
  },
  teamsScrollContent: {
    paddingHorizontal: 10,
    gap: 15,
  },
  teamOption: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    borderWidth: 2,
    borderColor: '#333',
    minWidth: 100,
  },
  selectedTeamOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#1a2e1a',
  },
  disabledTeamOption: {
    opacity: 0.5,
    borderColor: '#555',
  },
  teamOptionLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  teamOptionName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedTeamName: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  disabledTeamName: {
    color: '#555',
  },
  selectedTeamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    gap: 30,
  },
  selectedTeamCard: {
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 150,
    minHeight: 120,
    justifyContent: 'center',
  },
  selectedTeamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  selectedTeamLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

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

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = () => {
    try {
      const storedTeams = localStorage.getItem('teams');
      if (storedTeams) {
        setTeams(JSON.parse(storedTeams));
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const selectHomeTeam = (team: Team) => {
    setHomeTeam(team);
    if (awayTeam?.id === team.id) {
      setAwayTeam(null);
    }
  };

  const selectAwayTeam = (team: Team) => {
    setAwayTeam(team);
    if (homeTeam?.id === team.id) {
      setHomeTeam(null);
    }
  };

  const startAnalysis = () => {
    if (!homeTeam || !awayTeam) {
      alert('Selecione ambos os times para iniciar a análise');
      return;
    }
    
    if (homeTeam.id === awayTeam.id) {
      alert('Selecione times diferentes');
      return;
    }

    navigate('/analysis', {
      state: { homeTeam, awayTeam }
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>InteriorStats</h1>
        <p style={styles.subtitle}>by Fortunato</p>
      </div>

      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Configurar Análise</h2>
        
        {teams.length === 0 ? (
          <div style={styles.noTeamsContainer}>
            <p style={styles.noTeamsText}>Nenhum time cadastrado</p>
            <p style={styles.noTeamsSubtext}>
              Vá para a aba "Times" para cadastrar seus times primeiro
            </p>
          </div>
        ) : (
          <>
            {/* Home Team Selection */}
            <div style={styles.teamSelectionSection}>
              <h3 style={styles.teamLabel}>Time da Casa</h3>
              <div style={styles.teamsGrid}>
                {teams.map((team) => (
                  <button
                    key={team.id}
                    style={{
                      ...styles.teamOption,
                      ...(homeTeam?.id === team.id ? styles.selectedTeamOption : {}),
                      ...(awayTeam?.id === team.id ? styles.disabledTeamOption : {}),
                    }}
                    onClick={() => selectHomeTeam(team)}
                    disabled={awayTeam?.id === team.id}
                  >
                    <img src={team.logo} style={styles.teamOptionLogo} alt={team.name} />
                    <span style={{
                      ...styles.teamOptionName,
                      ...(homeTeam?.id === team.id ? styles.selectedTeamName : {}),
                      ...(awayTeam?.id === team.id ? styles.disabledTeamName : {}),
                    }}>
                      {team.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Away Team Selection */}
            <div style={styles.teamSelectionSection}>
              <h3 style={styles.teamLabel}>Time Visitante</h3>
              <div style={styles.teamsGrid}>
                {teams.map((team) => (
                  <button
                    key={team.id}
                    style={{
                      ...styles.teamOption,
                      ...(awayTeam?.id === team.id ? styles.selectedTeamOption : {}),
                      ...(homeTeam?.id === team.id ? styles.disabledTeamOption : {}),
                    }}
                    onClick={() => selectAwayTeam(team)}
                    disabled={homeTeam?.id === team.id}
                  >
                    <img src={team.logo} style={styles.teamOptionLogo} alt={team.name} />
                    <span style={{
                      ...styles.teamOptionName,
                      ...(awayTeam?.id === team.id ? styles.selectedTeamName : {}),
                      ...(homeTeam?.id === team.id ? styles.disabledTeamName : {}),
                    }}>
                      {team.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Teams Display */}
            {(homeTeam || awayTeam) && (
              <div style={styles.selectedTeamsContainer}>
                <div style={styles.selectedTeamCard}>
                  {homeTeam ? (
                    <>
                      <img src={homeTeam.logo} style={styles.selectedTeamLogo} alt={homeTeam.name} />
                      <p style={styles.selectedTeamLabel}>Casa</p>
                      <p style={styles.selectedTeamName}>{homeTeam.name}</p>
                    </>
                  ) : (
                    <p style={styles.placeholderText}>Time da Casa</p>
                  )}
                </div>
                
                <span style={styles.vsText}>VS</span>
                
                <div style={styles.selectedTeamCard}>
                  {awayTeam ? (
                    <>
                      <img src={awayTeam.logo} style={styles.selectedTeamLogo} alt={awayTeam.name} />
                      <p style={styles.selectedTeamLabel}>Visitante</p>
                      <p style={styles.selectedTeamName}>{awayTeam.name}</p>
                    </>
                  ) : (
                    <p style={styles.placeholderText}>Time Visitante</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {homeTeam && awayTeam && (
          <button style={styles.startButton} onClick={startAnalysis}>
            <Play size={24} color="#FFFFFF" />
            <span style={styles.startButtonText}>Iniciar Análise</span>
          </button>
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
  },
  header: {
    textAlign: 'center' as const,
    padding: '30px 0',
    borderBottom: '1px solid #333',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#4CAF50',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#888',
    marginTop: '4px',
  },
  content: {
    flex: 1,
    padding: '20px 60px',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    overflow: 'auto',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '30px',
  },
  noTeamsContainer: {
    textAlign: 'center' as const,
    paddingTop: '60px',
  },
  noTeamsText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '40px',
  },
  noTeamsSubtext: {
    fontSize: '14px',
    color: '#888',
  },
  teamSelectionSection: {
    marginBottom: '30px',
  },
  teamLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '10px',
  },
  teamsGrid: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap' as const,
    padding: '10px 0',
  },
  teamOption: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '15px',
    borderRadius: '12px',
    backgroundColor: '#1e1e1e',
    border: '2px solid #333',
    minWidth: '100px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  selectedTeamOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#1a2e1a',
  },
  disabledTeamOption: {
    opacity: 0.5,
    borderColor: '#555',
    cursor: 'not-allowed',
  },
  teamOptionLogo: {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    marginBottom: '8px',
    objectFit: 'cover' as const,
  },
  teamOptionName: {
    fontSize: '12px',
    color: '#FFFFFF',
    textAlign: 'center' as const,
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '30px 0',
    gap: '30px',
  },
  selectedTeamCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: '20px',
    borderRadius: '15px',
    border: '1px solid #333',
    minWidth: '150px',
    minHeight: '120px',
    justifyContent: 'center',
  },
  selectedTeamLogo: {
    width: '60px',
    height: '60px',
    borderRadius: '30px',
    marginBottom: '8px',
    objectFit: 'cover' as const,
  },
  selectedTeamLabel: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '4px',
  },
  selectedTeamName: {
    fontSize: '16px',
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center' as const,
  },
  placeholderText: {
    fontSize: '16px',
    color: '#888',
    textAlign: 'center' as const,
  },
  vsText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '18px',
    borderRadius: '12px',
    marginTop: '20px',
    gap: '10px',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    transition: 'background-color 0.2s ease',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 'bold',
  },
};

export default Navigation;
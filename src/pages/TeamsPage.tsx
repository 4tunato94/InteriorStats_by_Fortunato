import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Users, Upload, FileText } from 'lucide-react';

interface Player {
  id: string;
  number: string;
  name: string;
  position: string;
  role: 'titular' | 'reserva';
}

interface Team {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  players: Player[];
}

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4CAF50');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');
  
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerPosition, setPlayerPosition] = useState('');
  const [playerRole, setPlayerRole] = useState<'titular' | 'reserva'>('titular');

  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#000000', '#4CAF50', '#F44336'];
  const positions = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meio-campo', 'Atacante'];

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

  const saveTeams = (teamsToSave: Team[]) => {
    try {
      localStorage.setItem('teams', JSON.stringify(teamsToSave));
    } catch (error) {
      console.error('Error saving teams:', error);
    }
  };

  const addTeam = () => {
    if (!teamName.trim()) {
      alert('Digite o nome do time');
      return;
    }
    if (!teamLogo) {
      alert('Selecione o escudo do time');
      return;
    }

    const newTeam: Team = {
      id: Date.now().toString(),
      name: teamName.trim(),
      logo: teamLogo,
      primaryColor,
      secondaryColor,
      players: [],
    };

    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    saveTeams(updatedTeams);
    resetForm();
  };

  const editTeam = (id: string) => {
    const team = teams.find(t => t.id === id);
    if (team) {
      setTeamName(team.name);
      setTeamLogo(team.logo);
      setPrimaryColor(team.primaryColor);
      setSecondaryColor(team.secondaryColor);
      setEditingId(id);
    }
  };

  const saveEdit = () => {
    if (!teamName.trim()) {
      alert('Digite o nome do time');
      return;
    }
    if (!teamLogo) {
      alert('Selecione o escudo do time');
      return;
    }

    const updatedTeams = teams.map(team => 
      team.id === editingId 
        ? { ...team, name: teamName.trim(), logo: teamLogo, primaryColor, secondaryColor }
        : team
    );
    setTeams(updatedTeams);
    saveTeams(updatedTeams);
    resetForm();
  };

  const deleteTeam = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este time?')) {
      const updatedTeams = teams.filter(team => team.id !== id);
      setTeams(updatedTeams);
      saveTeams(updatedTeams);
    }
  };

  const resetForm = () => {
    setTeamName('');
    setTeamLogo('');
    setPrimaryColor('#4CAF50');
    setSecondaryColor('#FFFFFF');
    setIsAdding(false);
    setEditingId(null);
  };

  const openPlayersModal = (teamId: string) => {
    setSelectedTeamId(teamId);
    setShowPlayersModal(true);
  };

  const addPlayer = () => {
    if (!playerNumber.trim() || !playerName.trim() || !playerPosition) {
      alert('Preencha todos os campos do jogador');
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      number: playerNumber.trim(),
      name: playerName.trim(),
      position: playerPosition,
      role: playerRole,
    };

    const updatedTeams = teams.map(team => 
      team.id === selectedTeamId 
        ? { ...team, players: [...team.players, newPlayer] }
        : team
    );
    setTeams(updatedTeams);
    saveTeams(updatedTeams);

    setPlayerNumber('');
    setPlayerName('');
    setPlayerPosition('');
    setPlayerRole('titular');
    setIsAddingPlayer(false);
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gerenciar Times</h1>
        <button style={styles.addButton} onClick={() => setIsAdding(true)}>
          <Plus size={24} color="#FFFFFF" />
        </button>
      </div>

      {(isAdding || editingId) && (
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>
            {editingId ? 'Editar Time' : 'Novo Time'}
          </h2>
          
          <input
            style={styles.input}
            placeholder="Nome do time"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />

          <div style={styles.logoUpload}>
            {teamLogo ? (
              <img src={teamLogo} style={styles.logoPreview} alt="Logo preview" />
            ) : (
              <div style={styles.logoPlaceholder}>
                <Upload size={24} color="#888" />
                <p style={styles.logoPlaceholderText}>Escudo do Time *</p>
                <input
                  type="url"
                  placeholder="URL da imagem do escudo"
                  style={styles.logoInput}
                  value={teamLogo}
                  onChange={(e) => setTeamLogo(e.target.value)}
                />
              </div>
            )}
          </div>

          <p style={styles.colorLabel}>Cor Primária</p>
          <div style={styles.colorPicker}>
            {colors.map((color) => (
              <button
                key={`primary-${color}`}
                style={{
                  ...styles.colorOption,
                  backgroundColor: color,
                  ...(primaryColor === color ? styles.selectedColor : {}),
                }}
                onClick={() => setPrimaryColor(color)}
              />
            ))}
          </div>

          <p style={styles.colorLabel}>Cor Secundária</p>
          <div style={styles.colorPicker}>
            {colors.map((color) => (
              <button
                key={`secondary-${color}`}
                style={{
                  ...styles.colorOption,
                  backgroundColor: color,
                  ...(secondaryColor === color ? styles.selectedColor : {}),
                }}
                onClick={() => setSecondaryColor(color)}
              />
            ))}
          </div>

          <div style={styles.formButtons}>
            <button style={styles.cancelButton} onClick={resetForm}>
              Cancelar
            </button>
            <button style={styles.saveButton} onClick={editingId ? saveEdit : addTeam}>
              {editingId ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      <div style={styles.teamsList}>
        {teams.map((team) => (
          <div key={team.id} style={styles.teamItem}>
            <div style={styles.teamInfo}>
              <img src={team.logo} style={styles.teamItemLogo} alt={team.name} />
              <div style={styles.teamDetails}>
                <h3 style={styles.teamName}>{team.name}</h3>
                <div style={styles.teamColors}>
                  <div style={{ ...styles.colorIndicator, backgroundColor: team.primaryColor }} />
                  <div style={{ ...styles.colorIndicator, backgroundColor: team.secondaryColor }} />
                </div>
                <p style={styles.playersCount}>{team.players.length} jogadores</p>
              </div>
            </div>
            
            <div style={styles.teamActions}>
              <button style={styles.actionButton} onClick={() => openPlayersModal(team.id)}>
                <Users size={18} color="#2196F3" />
              </button>
              <button style={styles.actionButton} onClick={() => editTeam(team.id)}>
                <Edit3 size={18} color="#4CAF50" />
              </button>
              <button style={styles.actionButton} onClick={() => deleteTeam(team.id)}>
                <Trash2 size={18} color="#F44336" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Players Modal */}
      {showPlayersModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Jogadores - {selectedTeam?.name}
              </h2>
              <button style={styles.closeButton} onClick={() => setShowPlayersModal(false)}>
                Fechar
              </button>
            </div>

            <div style={styles.playersActions}>
              <button style={styles.addPlayerButton} onClick={() => setIsAddingPlayer(true)}>
                <Plus size={20} color="#FFFFFF" />
                <span>Novo Jogador</span>
              </button>
            </div>

            {isAddingPlayer && (
              <div style={styles.playerForm}>
                <div style={styles.playerFormRow}>
                  <input
                    style={{ ...styles.playerInput, flex: '0.3' }}
                    placeholder="Nº"
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(e.target.value)}
                  />
                  <input
                    style={{ ...styles.playerInput, flex: '0.7' }}
                    placeholder="Nome do jogador"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>

                <div style={styles.positionContainer}>
                  <p style={styles.positionLabel}>Posição</p>
                  <div style={styles.positionOptions}>
                    {positions.map((pos) => (
                      <button
                        key={pos}
                        style={{
                          ...styles.positionOption,
                          ...(playerPosition === pos ? styles.selectedPosition : {}),
                        }}
                        onClick={() => setPlayerPosition(pos)}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.roleContainer}>
                  <button
                    style={{
                      ...styles.roleOption,
                      ...(playerRole === 'titular' ? styles.selectedRole : {}),
                    }}
                    onClick={() => setPlayerRole('titular')}
                  >
                    Titular
                  </button>
                  <button
                    style={{
                      ...styles.roleOption,
                      ...(playerRole === 'reserva' ? styles.selectedRole : {}),
                    }}
                    onClick={() => setPlayerRole('reserva')}
                  >
                    Reserva
                  </button>
                </div>

                <div style={styles.playerFormButtons}>
                  <button
                    style={styles.cancelPlayerButton}
                    onClick={() => {
                      setIsAddingPlayer(false);
                      setPlayerNumber('');
                      setPlayerName('');
                      setPlayerPosition('');
                      setPlayerRole('titular');
                    }}
                  >
                    Cancelar
                  </button>
                  <button style={styles.savePlayerButton} onClick={addPlayer}>
                    Adicionar
                  </button>
                </div>
              </div>
            )}

            <div style={styles.playersList}>
              <h3 style={styles.playersSection}>Titulares</h3>
              {selectedTeam?.players.filter(p => p.role === 'titular').map((player) => (
                <div key={player.id} style={styles.playerItem}>
                  <span style={styles.playerNumber}>{player.number}</span>
                  <div style={styles.playerInfo}>
                    <p style={styles.playerName}>{player.name}</p>
                    <p style={styles.playerPosition}>{player.position}</p>
                  </div>
                </div>
              ))}

              <h3 style={styles.playersSection}>Reservas</h3>
              {selectedTeam?.players.filter(p => p.role === 'reserva').map((player) => (
                <div key={player.id} style={styles.playerItem}>
                  <span style={styles.playerNumber}>{player.number}</span>
                  <div style={styles.playerInfo}>
                    <p style={styles.playerName}>{player.name}</p>
                    <p style={styles.playerPosition}>{player.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #333',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
  },
  formContainer: {
    backgroundColor: '#1e1e1e',
    margin: '20px',
    maxHeight: '70%',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #333',
    overflow: 'auto',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '15px',
  },
  input: {
    backgroundColor: '#333',
    color: '#FFFFFF',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '15px',
    width: '100%',
  },
  logoUpload: {
    backgroundColor: '#333',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '15px',
    border: '2px dashed #555',
  },
  logoPreview: {
    width: '80px',
    height: '80px',
    borderRadius: '40px',
    objectFit: 'cover' as const,
  },
  logoPlaceholder: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
  },
  logoPlaceholderText: {
    color: '#888',
    fontSize: '14px',
  },
  logoInput: {
    marginTop: '10px',
    width: '100%',
  },
  colorLabel: {
    fontSize: '16px',
    color: '#FFFFFF',
    marginBottom: '10px',
    fontWeight: '600',
  },
  colorPicker: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
  },
  colorOption: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    border: '2px solid transparent',
    cursor: 'pointer',
  },
  selectedColor: {
    border: '3px solid #4CAF50',
  },
  formButtons: {
    display: 'flex',
    gap: '10px',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: '15px',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: '15px',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
  },
  teamsList: {
    flex: 1,
    padding: '20px',
    overflow: 'auto',
  },
  teamItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '10px',
    border: '1px solid #333',
  },
  teamInfo: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  teamItemLogo: {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    marginRight: '15px',
    objectFit: 'cover' as const,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: '16px',
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: '4px',
  },
  teamColors: {
    display: 'flex',
    gap: '8px',
    marginBottom: '4px',
  },
  colorIndicator: {
    width: '16px',
    height: '16px',
    borderRadius: '8px',
    border: '1px solid #555',
  },
  playersCount: {
    fontSize: '12px',
    color: '#888',
  },
  teamActions: {
    display: 'flex',
    gap: '15px',
  },
  actionButton: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#121212',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80%',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #333',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#333',
    padding: '8px 15px',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  playersActions: {
    display: 'flex',
    padding: '20px',
    gap: '10px',
  },
  addPlayerButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '15px',
    borderRadius: '8px',
    gap: '8px',
    color: '#FFFFFF',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  playerForm: {
    backgroundColor: '#1e1e1e',
    margin: '0 20px 20px',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #333',
  },
  playerFormRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  playerInput: {
    backgroundColor: '#333',
    color: '#FFFFFF',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '16px',
    border: 'none',
  },
  positionContainer: {
    marginBottom: '15px',
  },
  positionLabel: {
    fontSize: '14px',
    color: '#FFFFFF',
    marginBottom: '8px',
    fontWeight: '600',
  },
  positionOptions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  positionOption: {
    backgroundColor: '#333',
    padding: '8px 12px',
    borderRadius: '6px',
    color: '#FFFFFF',
    fontSize: '12px',
    border: 'none',
    cursor: 'pointer',
  },
  selectedPosition: {
    backgroundColor: '#4CAF50',
  },
  roleContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  roleOption: {
    flex: 1,
    backgroundColor: '#333',
    padding: '12px',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  selectedRole: {
    backgroundColor: '#4CAF50',
  },
  playerFormButtons: {
    display: 'flex',
    gap: '10px',
  },
  cancelPlayerButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: '12px',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  savePlayerButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: '12px',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
  },
  playersList: {
    flex: 1,
    padding: '20px',
    overflow: 'auto',
  },
  playersSection: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '15px',
    marginTop: '10px',
  },
  playerItem: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid #333',
  },
  playerNumber: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#4CAF50',
    width: '40px',
    textAlign: 'center' as const,
  },
  playerInfo: {
    flex: 1,
    marginLeft: '15px',
  },
  playerName: {
    fontSize: '16px',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playerPosition: {
    fontSize: '14px',
    color: '#888',
    marginTop: '2px',
  },
};

export default TeamsPage;
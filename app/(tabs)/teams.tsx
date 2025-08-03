import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Plus, CreditCard as Edit3, Trash2, Users, Upload, FileText, Download } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

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

export default function TeamsScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4CAF50');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');
  
  // Player management
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerPosition, setPlayerPosition] = useState('');
  const [playerRole, setPlayerRole] = useState<'titular' | 'reserva'>('titular');

  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#000000', '#4CAF50', '#F44336'];
  const positions = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meio-campo', 'Atacante'];

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

  const saveTeams = async (teamsToSave: Team[]) => {
    try {
      await AsyncStorage.setItem('teams', JSON.stringify(teamsToSave));
    } catch (error) {
      console.error('Error saving teams:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setTeamLogo(result.assets[0].uri);
    }
  };

  const addTeam = () => {
    if (!teamName.trim()) {
      Alert.alert('Erro', 'Digite o nome do time');
      return;
    }
    if (!teamLogo) {
      Alert.alert('Erro', 'Selecione o escudo do time');
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
      Alert.alert('Erro', 'Digite o nome do time');
      return;
    }
    if (!teamLogo) {
      Alert.alert('Erro', 'Selecione o escudo do time');
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
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este time?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const updatedTeams = teams.filter(team => team.id !== id);
            setTeams(updatedTeams);
            saveTeams(updatedTeams);
          },
        },
      ]
    );
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
      Alert.alert('Erro', 'Preencha todos os campos do jogador');
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

  const importPlayers = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/vnd.ms-excel', 'text/csv'],
      });

      if (!result.canceled) {
        Alert.alert('Importação', 'Funcionalidade de importação será implementada em breve');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao importar arquivo');
    }
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Times</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAdding(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {(isAdding || editingId) && (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>
            {editingId ? 'Editar Time' : 'Novo Time'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nome do time"
            placeholderTextColor="#888"
            value={teamName}
            onChangeText={setTeamName}
          />

          <TouchableOpacity style={styles.logoUpload} onPress={pickImage}>
            {teamLogo ? (
              <Image source={{ uri: teamLogo }} style={styles.logoPreview} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Upload size={24} color="#888" />
                <Text style={styles.logoPlaceholderText}>Escudo do Time *</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.colorLabel}>Cor Primária</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
            {colors.map((color) => (
              <TouchableOpacity
                key={`primary-${color}`}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  primaryColor === color && styles.selectedColor,
                ]}
                onPress={() => setPrimaryColor(color)}
              />
            ))}
          </ScrollView>

          <Text style={styles.colorLabel}>Cor Secundária</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
            {colors.map((color) => (
              <TouchableOpacity
                key={`secondary-${color}`}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  secondaryColor === color && styles.selectedColor,
                ]}
                onPress={() => setSecondaryColor(color)}
              />
            ))}
          </ScrollView>

          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={editingId ? saveEdit : addTeam}
            >
              <Text style={styles.saveButtonText}>
                {editingId ? 'Salvar' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <ScrollView style={styles.teamsList}>
        {teams.map((team) => (
          <View key={team.id} style={styles.teamItem}>
            <View style={styles.teamInfo}>
              <Image source={{ uri: team.logo }} style={styles.teamItemLogo} />
              <View style={styles.teamDetails}>
                <Text style={styles.teamName}>{team.name}</Text>
                <View style={styles.teamColors}>
                  <View style={[styles.colorIndicator, { backgroundColor: team.primaryColor }]} />
                  <View style={[styles.colorIndicator, { backgroundColor: team.secondaryColor }]} />
                </View>
                <Text style={styles.playersCount}>{team.players.length} jogadores</Text>
              </View>
            </View>
            
            <View style={styles.teamActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openPlayersModal(team.id)}
              >
                <Users size={18} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => editTeam(team.id)}
              >
                <Edit3 size={18} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => deleteTeam(team.id)}
              >
                <Trash2 size={18} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Players Modal */}
      <Modal
        visible={showPlayersModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Jogadores - {selectedTeam?.name}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPlayersModal(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.playersActions}>
            <TouchableOpacity
              style={styles.addPlayerButton}
              onPress={() => setIsAddingPlayer(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addPlayerText}>Novo Jogador</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.importButton}
              onPress={importPlayers}
            >
              <FileText size={20} color="#FFFFFF" />
              <Text style={styles.importText}>Importar Lista</Text>
            </TouchableOpacity>
          </View>

          {isAddingPlayer && (
            <View style={styles.playerForm}>
              <View style={styles.playerFormRow}>
                <TextInput
                  style={[styles.playerInput, { flex: 0.3 }]}
                  placeholder="Nº"
                  placeholderTextColor="#888"
                  value={playerNumber}
                  onChangeText={setPlayerNumber}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.playerInput, { flex: 0.7 }]}
                  placeholder="Nome do jogador"
                  placeholderTextColor="#888"
                  value={playerName}
                  onChangeText={setPlayerName}
                />
              </View>

              <View style={styles.playerFormRow}>
                <View style={styles.positionContainer}>
                  <Text style={styles.positionLabel}>Posição</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {positions.map((pos) => (
                      <TouchableOpacity
                        key={pos}
                        style={[
                          styles.positionOption,
                          playerPosition === pos && styles.selectedPosition
                        ]}
                        onPress={() => setPlayerPosition(pos)}
                      >
                        <Text style={[
                          styles.positionText,
                          playerPosition === pos && styles.selectedPositionText
                        ]}>
                          {pos}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    playerRole === 'titular' && styles.selectedRole
                  ]}
                  onPress={() => setPlayerRole('titular')}
                >
                  <Text style={[
                    styles.roleText,
                    playerRole === 'titular' && styles.selectedRoleText
                  ]}>
                    Titular
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    playerRole === 'reserva' && styles.selectedRole
                  ]}
                  onPress={() => setPlayerRole('reserva')}
                >
                  <Text style={[
                    styles.roleText,
                    playerRole === 'reserva' && styles.selectedRoleText
                  ]}>
                    Reserva
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.playerFormButtons}>
                <TouchableOpacity
                  style={styles.cancelPlayerButton}
                  onPress={() => {
                    setIsAddingPlayer(false);
                    setPlayerNumber('');
                    setPlayerName('');
                    setPlayerPosition('');
                    setPlayerRole('titular');
                  }}
                >
                  <Text style={styles.cancelPlayerText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.savePlayerButton}
                  onPress={addPlayer}
                >
                  <Text style={styles.savePlayerText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <ScrollView style={styles.playersList}>
            <Text style={styles.playersSection}>Titulares</Text>
            {selectedTeam?.players.filter(p => p.role === 'titular').map((player) => (
              <View key={player.id} style={styles.playerItem}>
                <Text style={styles.playerNumber}>{player.number}</Text>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerPosition}>{player.position}</Text>
                </View>
              </View>
            ))}

            <Text style={styles.playersSection}>Reservas</Text>
            {selectedTeam?.players.filter(p => p.role === 'reserva').map((player) => (
              <View key={player.id} style={styles.playerItem}>
                <Text style={styles.playerNumber}>{player.number}</Text>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerPosition}>{player.position}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#1e1e1e',
    margin: 20,
    maxHeight: '70%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#333',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  logoUpload: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
  },
  logoPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  logoPlaceholderText: {
    color: '#888',
    marginTop: 8,
    fontSize: 14,
  },
  colorLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '600',
  },
  colorPicker: {
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamsList: {
    flex: 1,
    padding: 20,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamItemLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  teamColors: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  playersCount: {
    fontSize: 12,
    color: '#888',
  },
  teamActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playersActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  addPlayerButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  addPlayerText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  importButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  importText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playerForm: {
    backgroundColor: '#1e1e1e',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  playerFormRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  playerInput: {
    backgroundColor: '#333',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  positionContainer: {
    flex: 1,
  },
  positionLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  positionOption: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  selectedPosition: {
    backgroundColor: '#4CAF50',
  },
  positionText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  selectedPositionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  roleOption: {
    flex: 1,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#4CAF50',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedRoleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  playerFormButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelPlayerButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelPlayerText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  savePlayerButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  savePlayerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  playersList: {
    flex: 1,
    padding: 20,
  },
  playersSection: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    marginTop: 10,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  playerNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    width: 40,
    textAlign: 'center',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playerPosition: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
});
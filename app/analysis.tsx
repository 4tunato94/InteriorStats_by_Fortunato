import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
  Image,
  TextInput,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Play, Pause, Activity, History, ArrowLeft, X, CreditCard as Edit3, Trash2, Save } from 'lucide-react-native';
import { router } from 'expo-router';

const FIELD_COLS = 20;
const FIELD_ROWS = 13;

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

interface GameEvent {
  id: string;
  timestamp: string;
  team: Team;
  action: string;
  position: { x: number; y: number };
  player?: Player;
  secondaryPlayer?: Player;
}

interface FieldPosition {
  x: number;
  y: number;
}

interface ActionSetup {
  changePossession: boolean;
  requiresPlayer: boolean;
  reverseAction: boolean;
  multiplePlayer: boolean;
  teamChange: boolean;
}

interface GameAction {
  id: string;
  name: string;
  emoji: string;
  setup: ActionSetup;
}

export default function AnalysisScreen() {
  const params = useLocalSearchParams();
  
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [ballPosition, setBallPosition] = useState<FieldPosition | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [pendingAction, setPendingAction] = useState<GameAction | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedSecondaryPlayer, setSelectedSecondaryPlayer] = useState<Player | null>(null);
  const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editActionName, setEditActionName] = useState('');
  const [editSelectedPlayer, setEditSelectedPlayer] = useState<Player | null>(null);
  const [gameActions, setGameActions] = useState<GameAction[]>([
    { 
      id: '1', 
      name: 'Gol', 
      emoji: '⚽', 
      setup: { 
        changePossession: true, 
        requiresPlayer: true, 
        reverseAction: false, 
        multiplePlayer: false, 
        teamChange: false 
      }
    },
    { 
      id: '2', 
      name: 'Falta', 
      emoji: '🟨', 
      setup: { 
        changePossession: true, 
        requiresPlayer: true, 
        reverseAction: true, 
        multiplePlayer: false, 
        teamChange: false 
      }
    },
    { 
      id: '3', 
      name: 'Substituição', 
      emoji: '🔄', 
      setup: { 
        changePossession: false, 
        requiresPlayer: false, 
        reverseAction: false, 
        multiplePlayer: true, 
        teamChange: true 
      }
    },
    { 
      id: '4', 
      name: 'Finalização', 
      emoji: '🎯', 
      setup: { 
        changePossession: false, 
        requiresPlayer: true, 
        reverseAction: false, 
        multiplePlayer: false, 
        teamChange: false 
      }
    },
    { 
      id: '5', 
      name: 'Passe', 
      emoji: '⚽', 
      setup: { 
        changePossession: false, 
        requiresPlayer: true, 
        reverseAction: false, 
        multiplePlayer: false, 
        teamChange: false 
      }
    },
    { 
      id: '6', 
      name: 'Cartão Amarelo', 
      emoji: '🟨', 
      setup: { 
        changePossession: false, 
        requiresPlayer: true, 
        reverseAction: true, 
        multiplePlayer: false, 
        teamChange: false 
      }
    },
    { 
      id: '7', 
      name: 'Cartão Vermelho', 
      emoji: '🟥', 
      setup: { 
        changePossession: false, 
        requiresPlayer: true, 
        reverseAction: true, 
        multiplePlayer: false, 
        teamChange: false 
      }
    },
    { 
      id: '8', 
      name: 'Escanteio', 
      emoji: '⛳', 
      setup: { 
        changePossession: true, 
        requiresPlayer: false, 
        reverseAction: false, 
        multiplePlayer: false, 
        teamChange: false 
      }
    },
  ]);
  
  const slideAnim = useRef(new Animated.Value(400)).current; // Start off-screen
  const historySlideAnim = useRef(new Animated.Value(400)).current; // Start off-screen
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickRef = useRef<number>(0);

  // Parse teams data only once
  useEffect(() => {
    const parseTeams = () => {
      try {
        if (params.homeTeam && params.awayTeam) {
          const home = JSON.parse(params.homeTeam as string);
          const away = JSON.parse(params.awayTeam as string);
          
          setHomeTeam(home);
          setAwayTeam(away);
          setSelectedTeam(home); // Set home team as initial selection
          setTeamsLoaded(true);
        }
      } catch (error) {
        console.error('Error parsing team data:', error);
        Alert.alert('Erro', 'Erro ao carregar dados dos times');
        router.back();
      }
    };

    parseTeams();
  }, [params.homeTeam, params.awayTeam]);

  // Screen orientation and dimensions
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => {
      subscription?.remove();
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerClick = () => {
    const now = Date.now();
    const timeDiff = now - lastClickRef.current;
    
    if (timeDiff < 300) {
      // Double click - reset
      setTime(0);
      setIsRunning(false);
    } else {
      // Single click - start/pause
      setIsRunning(!isRunning);
    }
    
    lastClickRef.current = now;
  };

  const toggleTeam = () => {
    if (homeTeam && awayTeam && selectedTeam) {
      setSelectedTeam(selectedTeam.id === homeTeam.id ? awayTeam : homeTeam);
    }
  };

  const toggleActions = () => {
    if (showActions) {
      Animated.timing(slideAnim, {
        toValue: screenData.width * 0.3,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowActions(false));
    } else {
      setShowActions(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleHistory = () => {
    if (showHistory) {
      Animated.timing(historySlideAnim, {
        toValue: screenData.width * 0.3,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowHistory(false));
    } else {
      setShowHistory(true);
      Animated.timing(historySlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleFieldPress = (col: number, row: number) => {
    if (!selectedTeam) return;
    
    const position = { x: col, y: row };
    setBallPosition(position);
    
    const newEvent: GameEvent = {
      id: Date.now().toString(),
      timestamp: formatTime(time),
      team: selectedTeam,
      action: 'Posse de Bola',
      position,
    };
    
    setEvents(prev => [...prev, newEvent]);
  };

  const addEvent = (actionName: string) => {
    const action = gameActions.find(a => a.name === actionName);
    if (!action) return;
    
    if (!ballPosition) {
      Alert.alert('Erro', 'Clique no campo para definir a posição primeiro');
      return;
    }

    // Check if action requires player selection
    if (action.setup.requiresPlayer || action.setup.multiplePlayer) {
      setPendingAction(action);
      setShowPlayerSelection(true);
      toggleActions(); // Close actions panel
      return;
    }

    // Execute action directly if no player selection needed
    executeAction(action, null, null);
  };

  const executeAction = (action: GameAction, player: Player | null, secondaryPlayer: Player | null) => {
    if (!ballPosition) return;

    // Determine which team the action belongs to
    let actionTeam = selectedTeam;
    if (action.setup.reverseAction && homeTeam && awayTeam) {
      actionTeam = selectedTeam?.id === homeTeam.id ? awayTeam : homeTeam;
    }

    if (!actionTeam) return;

    const newEvent: GameEvent = {
      id: Date.now().toString(),
      timestamp: formatTime(time),
      team: actionTeam,
      action: action.name,
      position: ballPosition,
      player: player || undefined,
      secondaryPlayer: secondaryPlayer || undefined,
    };
    
    setEvents(prev => [...prev, newEvent]);

    // Change possession if configured
    if (action.setup.changePossession && homeTeam && awayTeam) {
      setSelectedTeam(selectedTeam?.id === homeTeam.id ? awayTeam : homeTeam);
    }

    // Reset selections
    setSelectedPlayer(null);
    setSelectedSecondaryPlayer(null);
    setPendingAction(null);
  };

  const handlePlayerSelection = () => {
    if (!pendingAction) return;

    if (pendingAction.setup.multiplePlayer && (!selectedPlayer || !selectedSecondaryPlayer)) {
      Alert.alert('Erro', 'Selecione dois jogadores para esta ação');
      return;
    }

    if (pendingAction.setup.requiresPlayer && !selectedPlayer) {
      Alert.alert('Erro', 'Selecione um jogador para esta ação');
      return;
    }

    executeAction(pendingAction, selectedPlayer, selectedSecondaryPlayer);
    setShowPlayerSelection(false);
  };

  const deleteEvent = (eventId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setEvents(prev => prev.filter(event => event.id !== eventId));
          },
        },
      ]
    );
  };

  const editEvent = (event: GameEvent) => {
    setEditingEvent(event);
    setEditActionName(event.action);
    setEditSelectedPlayer(event.player || null);
    setShowEditModal(true);
    toggleHistory(); // Close history panel
  };

  const saveEditedEvent = () => {
    if (!editingEvent || !editActionName.trim()) {
      Alert.alert('Erro', 'Digite o nome da ação');
      return;
    }

    setEvents(prev => prev.map(event => 
      event.id === editingEvent.id 
        ? { 
            ...event, 
            action: editActionName.trim(),
            player: editSelectedPlayer || undefined
          }
        : event
    ));

    setShowEditModal(false);
    setEditingEvent(null);
    setEditActionName('');
    setEditSelectedPlayer(null);
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingEvent(null);
    setEditActionName('');
    setEditSelectedPlayer(null);
  };

  const renderField = () => {
    const fieldWidth = screenData.width - 40;
    const fieldHeight = screenData.height - 120;
    const cellWidth = fieldWidth / FIELD_COLS;
    const cellHeight = fieldHeight / FIELD_ROWS;

    const cells = [];
    for (let row = 0; row < FIELD_ROWS; row++) {
      for (let col = 0; col < FIELD_COLS; col++) {
        const isActive = ballPosition?.x === col && ballPosition?.y === row;
        
        cells.push(
          <TouchableOpacity
            key={`${row}-${col}`}
            style={[
              styles.fieldCell,
              {
                width: cellWidth,
                height: cellHeight,
                left: col * cellWidth,
                top: row * cellHeight,
              },
              isActive && selectedTeam && {
                backgroundColor: selectedTeam.primaryColor + '40',
                borderColor: selectedTeam.primaryColor,
                borderWidth: 2,
                borderRadius: 4,
              }
            ]}
            onPress={() => handleFieldPress(col, row)}
          />
        );
      }
    }

    return cells;
  };

  // Show loading until teams are loaded
  if (!teamsLoaded || !homeTeam || !awayTeam || !selectedTeam) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const actions = [
    'Gol', 'Finalização', 'Passe', 'Falta', 'Cartão Amarelo', 
    'Cartão Vermelho', 'Escanteio', 'Impedimento'
  ];

  return (
    <View style={[styles.container, { width: screenData.width, height: screenData.height }]}>
      <StatusBar hidden />
      
      {/* Timer */}
      <View style={styles.timerContainer}>
        <TouchableOpacity onPress={handleTimerClick}>
          <Text style={styles.timer}>{formatTime(time)}</Text>
        </TouchableOpacity>
      </View>

      {/* Field */}
      <View style={styles.fieldContainer}>
        <View style={[styles.field, { 
          width: screenData.width - 40, 
          height: screenData.height - 120 
        }]}>
          <View
            style={[
              styles.fieldBackground,
            ]}
          >
            <Image
              source={require('../assets/images/campov3-horizontal.png')}
              style={styles.fieldBackgroundImage}
              resizeMode="cover"
            />
            {renderField()}
          </View>
          
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleTimerClick}>
          {isRunning ? <Pause size={24} color="#FFFFFF" /> : <Play size={24} color="#FFFFFF" />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.teamButton} 
          onPress={toggleTeam}
        >
          <Image source={{ uri: selectedTeam.logo }} style={styles.teamButtonLogo} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleActions}>
          <Activity size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleHistory}>
          <History size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Actions Panel */}
      <Animated.View 
        style={[
          styles.actionsPanel,
          { 
            width: screenData.width * 0.3, 
            height: screenData.height,
            right: 0,
          },
          {
            transform: [{ translateX: slideAnim }],
          }
        ]}
        pointerEvents={showActions ? 'auto' : 'none'}
      >
        <View style={styles.actionsPanelHeader}>
          <Text style={styles.actionsPanelTitle}>Ações</Text>
          <TouchableOpacity onPress={toggleActions}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionsList}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action}
              style={styles.actionButton}
              onPress={() => addEvent(action)}
            >
              <Text style={styles.actionButtonText}>{action}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* History Panel */}
      <Animated.View 
        style={[
          styles.historyPanel,
          { 
            width: screenData.width * 0.3, 
            height: screenData.height,
            right: 0,
          },
          {
            transform: [{ translateX: historySlideAnim }],
          }
        ]}
        pointerEvents={showHistory ? 'auto' : 'none'}
      >
        <View style={styles.historyPanelHeader}>
          <Text style={styles.historyPanelTitle}>Histórico</Text>
          <TouchableOpacity onPress={toggleHistory}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.eventsList}>
          {events.slice().reverse().map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={styles.eventHeader}>
                <View style={styles.eventLeftContent}>
                  <Text style={styles.eventTime}>{event.timestamp}</Text>
                  <Text style={styles.eventAction}>{event.action}</Text>
                  
                  <View style={styles.eventTeamInfo}>
                    <View style={[styles.eventTeamIndicator, { backgroundColor: event.team.primaryColor }]} />
                    <Text style={styles.eventTeamName}>{event.team.name}</Text>
                  </View>
                  
                  {event.player && (
                    <Text style={styles.eventPlayer}>
                      #{event.player.number} {event.player.name} ({event.player.position})
                    </Text>
                  )}
                  
                  {event.secondaryPlayer && (
                    <Text style={styles.eventSecondaryPlayer}>
                      Saiu: #{event.secondaryPlayer.number} {event.secondaryPlayer.name}
                    </Text>
                  )}
                  
                  <Text style={styles.eventPosition}>
                    Posição: ({event.position.x}, {event.position.y})
                  </Text>
                </View>
                
                <View style={styles.eventRightActions}>
                  <TouchableOpacity
                    style={styles.eventActionButton}
                    onPress={() => editEvent(event)}
                  >
                    <Edit3 size={18} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.eventActionButton}
                    onPress={() => deleteEvent(event.id)}
                  >
                    <Trash2 size={18} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Player Selection Modal */}
      <Modal
        visible={showPlayerSelection}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPlayerSelection(false)}
      >
        <View style={styles.playerSelectionContainer}>
          <View style={styles.playerSelectionHeader}>
            <Text style={styles.playerSelectionTitle}>
              {pendingAction?.name} - Selecionar Jogador
            </Text>
            <TouchableOpacity
              style={styles.closePlayerSelection}
              onPress={() => setShowPlayerSelection(false)}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {pendingAction?.setup.multiplePlayer && (
            <View style={styles.multiplePlayerInfo}>
              <Text style={styles.multiplePlayerText}>
                Esta ação requer dois jogadores (ex: substituição)
              </Text>
            </View>
          )}

          <ScrollView style={styles.playerSelectionList}>
            <Text style={styles.playerSectionTitle}>
              {pendingAction?.setup.multiplePlayer ? 'Jogador que Entra:' : 'Selecionar Jogador:'}
            </Text>
            
            {selectedTeam?.players
              .filter(p => p.role === 'titular')
              .map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.playerSelectionItem,
                    selectedPlayer?.id === player.id && styles.selectedPlayerItem
                  ]}
                  onPress={() => setSelectedPlayer(player)}
                >
                  <Text style={styles.playerSelectionNumber}>#{player.number}</Text>
                  <View style={styles.playerSelectionInfo}>
                    <Text style={styles.playerSelectionName}>{player.name}</Text>
                    <Text style={styles.playerSelectionPosition}>{player.position}</Text>
                  </View>
                </TouchableOpacity>
              ))}

            {pendingAction?.setup.multiplePlayer && (
              <>
                <Text style={styles.playerSectionTitle}>Jogador que Sai:</Text>
                {selectedTeam?.players
                  .filter(p => p.role === 'titular')
                  .map((player) => (
                    <TouchableOpacity
                      key={`secondary-${player.id}`}
                      style={[
                        styles.playerSelectionItem,
                        selectedSecondaryPlayer?.id === player.id && styles.selectedPlayerItem
                      ]}
                      onPress={() => setSelectedSecondaryPlayer(player)}
                    >
                      <Text style={styles.playerSelectionNumber}>#{player.number}</Text>
                      <View style={styles.playerSelectionInfo}>
                        <Text style={styles.playerSelectionName}>{player.name}</Text>
                        <Text style={styles.playerSelectionPosition}>{player.position}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </>
            )}
          </ScrollView>

          <View style={styles.playerSelectionActions}>
            <TouchableOpacity
              style={styles.cancelPlayerSelectionButton}
              onPress={() => setShowPlayerSelection(false)}
            >
              <Text style={styles.cancelPlayerSelectionText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmPlayerSelectionButton}
              onPress={handlePlayerSelection}
            >
              <Text style={styles.confirmPlayerSelectionText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={cancelEdit}
      >
        <SafeAreaView style={styles.editEventContainer}>
          <View style={styles.editEventHeader}>
            <Text style={styles.editEventTitle}>Editar Evento</Text>
            <TouchableOpacity
              style={styles.closeEditEvent}
              onPress={cancelEdit}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.editEventForm}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.editEventLabel}>Nome da Ação</Text>
            <TextInput
              style={styles.editEventInput}
              placeholder="Nome da ação"
              placeholderTextColor="#888"
              value={editActionName}
              onChangeText={setEditActionName}
            />

            <View style={styles.editEventInfo}>
              <Text style={styles.editEventInfoLabel}>Informações do Evento</Text>
              <Text style={styles.editEventInfoValue}>
                Tempo: {editingEvent?.timestamp}
              </Text>
              <Text style={styles.editEventInfoValue}>
                Time: {editingEvent?.team.name}
              </Text>
              <Text style={styles.editEventInfoValue}>
                Posição: ({editingEvent?.position.x}, {editingEvent?.position.y})
              </Text>
            </View>

            <Text style={styles.editEventLabel}>Jogador (opcional)</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.editPlayersList}
            >
              <TouchableOpacity
                style={[
                  styles.editPlayerOption,
                  !editSelectedPlayer && styles.selectedEditPlayer
                ]}
                onPress={() => setEditSelectedPlayer(null)}
              >
                <Text style={styles.editPlayerText}>Nenhum</Text>
              </TouchableOpacity>
              
              {editingEvent?.team.players
                .filter(p => p.role === 'titular')
                .map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={[
                      styles.editPlayerOption,
                      editSelectedPlayer?.id === player.id && styles.selectedEditPlayer
                    ]}
                    onPress={() => setEditSelectedPlayer(player)}
                  >
                    <Text style={styles.editPlayerNumber}>#{player.number}</Text>
                    <Text style={styles.editPlayerName}>{player.name}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </ScrollView>

          <View style={styles.editEventActions}>
            <TouchableOpacity
              style={styles.cancelEditButton}
              onPress={cancelEdit}
            >
              <Text style={styles.cancelEditText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveEditButton}
              onPress={saveEditedEvent}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveEditText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d5d2b',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -50 }],
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fieldContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 80,
  },
  field: {
    backgroundColor: '#0d5d2b',
    borderWidth: 0,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  fieldCell: {
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 2,
    borderWidth: 0,
  },
  fieldBackground: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#0d5d2b',
  },
  fieldBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    gap: 15,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  teamButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 3,
  },
  teamButtonLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  actionsPanel: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderLeftWidth: 1,
    borderLeftColor: '#333',
  },
  actionsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  actionsPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionsList: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  historyPanel: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderLeftWidth: 1,
    borderLeftColor: '#333',
  },
  historyPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  historyPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventsList: {
    padding: 20,
  },
  eventItem: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventLeftContent: {
    flex: 1,
    marginRight: 12,
  },
  eventRightActions: {
    flexDirection: 'column',
    gap: 8,
  },
  eventActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  eventTime: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventAction: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventTeamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTeamIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  eventTeamName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  eventPlayer: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 4,
    fontWeight: '500',
  },
  eventSecondaryPlayer: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 4,
    fontWeight: '500',
  },
  eventPosition: {
    fontSize: 11,
    color: '#888',
  },
  editEventContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  editEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  editEventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeEditEvent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editEventForm: {
    flex: 1,
    padding: 20,
  },
  editEventLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '600',
  },
  editEventInput: {
    backgroundColor: '#333',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  editEventInfo: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  editEventInfoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    fontWeight: '600',
  },
  editEventInfoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  editPlayersList: {
    maxHeight: 80,
    marginBottom: 20,
  },
  editPlayerOption: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEditPlayer: {
    borderColor: '#4CAF50',
    backgroundColor: '#1a2e1a',
  },
  editPlayerNumber: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  editPlayerName: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
  },
  editPlayerText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editEventActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#121212',
  },
  cancelEditButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelEditText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveEditButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  saveEditText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerSelectionContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  playerSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playerSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  closePlayerSelection: {
    padding: 8,
  },
  multiplePlayerInfo: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  multiplePlayerText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  playerSelectionList: {
    flex: 1,
    padding: 20,
  },
  playerSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    marginTop: 10,
  },
  playerSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedPlayerItem: {
    borderColor: '#4CAF50',
    backgroundColor: '#1a2e1a',
  },
  playerSelectionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    width: 40,
    textAlign: 'center',
  },
  playerSelectionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerSelectionName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playerSelectionPosition: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  playerSelectionActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  cancelPlayerSelectionButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelPlayerSelectionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmPlayerSelectionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmPlayerSelectionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
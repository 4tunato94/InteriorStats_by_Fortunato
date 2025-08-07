import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, Activity, History, ArrowLeft, X, Edit3, Trash2, Save } from 'lucide-react';

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

const AnalysisPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { homeTeam, awayTeam } = location.state || {};
  
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(homeTeam);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [ballPosition, setBallPosition] = useState<FieldPosition | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickRef = useRef<number>(0);

  useEffect(() => {
    if (!homeTeam || !awayTeam) {
      navigate('/');
      return;
    }
  }, [homeTeam, awayTeam, navigate]);

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
      setTime(0);
      setIsRunning(false);
    } else {
      setIsRunning(!isRunning);
    }
    
    lastClickRef.current = now;
  };

  const toggleTeam = () => {
    if (homeTeam && awayTeam && selectedTeam) {
      setSelectedTeam(selectedTeam.id === homeTeam.id ? awayTeam : homeTeam);
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
    if (!ballPosition) {
      alert('Clique no campo para definir a posição primeiro');
      return;
    }

    const newEvent: GameEvent = {
      id: Date.now().toString(),
      timestamp: formatTime(time),
      team: selectedTeam!,
      action: actionName,
      position: ballPosition,
    };
    
    setEvents(prev => [...prev, newEvent]);
  };

  const deleteEvent = (eventId: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

  const renderField = () => {
    const fieldWidth = window.innerWidth - 40;
    const fieldHeight = window.innerHeight - 120;
    const cellWidth = fieldWidth / FIELD_COLS;
    const cellHeight = fieldHeight / FIELD_ROWS;

    const cells = [];
    for (let row = 0; row < FIELD_ROWS; row++) {
      for (let col = 0; col < FIELD_COLS; col++) {
        const isActive = ballPosition?.x === col && ballPosition?.y === row;
        
        cells.push(
          <div
            key={`${row}-${col}`}
            style={{
              ...styles.fieldCell,
              width: cellWidth,
              height: cellHeight,
              left: col * cellWidth,
              top: row * cellHeight,
              ...(isActive && selectedTeam ? {
                backgroundColor: selectedTeam.primaryColor + '40',
                border: `2px solid ${selectedTeam.primaryColor}`,
                borderRadius: '4px',
              } : {}),
            }}
            onClick={() => handleFieldPress(col, row)}
          />
        );
      }
    }

    return cells;
  };

  if (!homeTeam || !awayTeam || !selectedTeam) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Carregando...</p>
      </div>
    );
  }

  const actions = [
    'Gol', 'Finalização', 'Passe', 'Falta', 'Cartão Amarelo', 
    'Cartão Vermelho', 'Escanteio', 'Impedimento'
  ];

  return (
    <div style={styles.container}>
      {/* Timer */}
      <div style={styles.timerContainer}>
        <button style={styles.timerButton} onClick={handleTimerClick}>
          <span style={styles.timer}>{formatTime(time)}</span>
        </button>
      </div>

      {/* Field */}
      <div style={styles.fieldContainer}>
        <div style={styles.field}>
          <div style={styles.fieldBackground}>
            <img
              src="https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg"
              style={styles.fieldBackgroundImage}
              alt="Campo de futebol"
            />
            {renderField()}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button style={styles.controlButton} onClick={handleTimerClick}>
          {isRunning ? <Pause size={24} color="#FFFFFF" /> : <Play size={24} color="#FFFFFF" />}
        </button>
        
        <button style={styles.teamButton} onClick={toggleTeam}>
          <img src={selectedTeam.logo} style={styles.teamButtonLogo} alt={selectedTeam.name} />
        </button>
        
        <button style={styles.controlButton} onClick={() => setShowActions(!showActions)}>
          <Activity size={24} color="#FFFFFF" />
        </button>
        
        <button style={styles.controlButton} onClick={() => setShowHistory(!showHistory)}>
          <History size={24} color="#FFFFFF" />
        </button>
      </div>

      {/* Back button */}
      <button style={styles.backButton} onClick={() => navigate('/')}>
        <ArrowLeft size={24} color="#FFFFFF" />
      </button>

      {/* Actions Panel */}
      {showActions && (
        <div style={styles.actionsPanel}>
          <div style={styles.actionsPanelHeader}>
            <h3 style={styles.actionsPanelTitle}>Ações</h3>
            <button onClick={() => setShowActions(false)}>
              <X size={24} color="#FFFFFF" />
            </button>
          </div>
          
          <div style={styles.actionsList}>
            {actions.map((action) => (
              <button
                key={action}
                style={styles.actionButton}
                onClick={() => addEvent(action)}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div style={styles.historyPanel}>
          <div style={styles.historyPanelHeader}>
            <h3 style={styles.historyPanelTitle}>Histórico</h3>
            <button onClick={() => setShowHistory(false)}>
              <X size={24} color="#FFFFFF" />
            </button>
          </div>
          
          <div style={styles.eventsList}>
            {events.slice().reverse().map((event) => (
              <div key={event.id} style={styles.eventItem}>
                <div style={styles.eventHeader}>
                  <div style={styles.eventLeftContent}>
                    <p style={styles.eventTime}>{event.timestamp}</p>
                    <p style={styles.eventAction}>{event.action}</p>
                    
                    <div style={styles.eventTeamInfo}>
                      <div style={{ ...styles.eventTeamIndicator, backgroundColor: event.team.primaryColor }} />
                      <span style={styles.eventTeamName}>{event.team.name}</span>
                    </div>
                    
                    <p style={styles.eventPosition}>
                      Posição: ({event.position.x}, {event.position.y})
                    </p>
                  </div>
                  
                  <div style={styles.eventRightActions}>
                    <button style={styles.eventActionButton}>
                      <Edit3 size={18} color="#4CAF50" />
                    </button>
                    <button style={styles.eventActionButton} onClick={() => deleteEvent(event.id)}>
                      <Trash2 size={18} color="#F44336" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative' as const,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0d5d2b',
    overflow: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  timerContainer: {
    position: 'absolute' as const,
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
  },
  timerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '8px 20px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
  },
  timer: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fieldContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    paddingTop: '60px',
    paddingBottom: '80px',
  },
  field: {
    width: 'calc(100vw - 40px)',
    height: 'calc(100vh - 120px)',
    backgroundColor: '#0d5d2b',
    borderRadius: '8px',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  fieldCell: {
    position: 'absolute' as const,
    backgroundColor: 'transparent',
    zIndex: 2,
    cursor: 'pointer',
  },
  fieldBackground: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    backgroundColor: '#0d5d2b',
  },
  fieldBackgroundImage: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    objectFit: 'cover' as const,
  },
  controls: {
    position: 'absolute' as const,
    bottom: '20px',
    left: '20px',
    display: 'flex',
    gap: '15px',
  },
  controlButton: {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFFFFF',
    cursor: 'pointer',
  },
  teamButton: {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFFFFF',
    padding: '3px',
    cursor: 'pointer',
  },
  teamButtonLogo: {
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    objectFit: 'cover' as const,
  },
  backButton: {
    position: 'absolute' as const,
    top: '20px',
    left: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFFFFF',
    cursor: 'pointer',
  },
  actionsPanel: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: '30%',
    height: '100vh',
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderLeft: '1px solid #333',
  },
  actionsPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #333',
  },
  actionsPanelTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionsList: {
    padding: '20px',
  },
  actionButton: {
    backgroundColor: '#1e1e1e',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '10px',
    border: '1px solid #333',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center' as const,
    width: '100%',
    cursor: 'pointer',
  },
  historyPanel: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: '30%',
    height: '100vh',
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderLeft: '1px solid #333',
  },
  historyPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #333',
  },
  historyPanelTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventsList: {
    padding: '20px',
    height: 'calc(100vh - 80px)',
    overflow: 'auto',
  },
  eventItem: {
    backgroundColor: '#1e1e1e',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '12px',
    border: '1px solid #333',
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventLeftContent: {
    flex: 1,
    marginRight: '12px',
  },
  eventRightActions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  eventActionButton: {
    width: '36px',
    height: '36px',
    borderRadius: '18px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
  },
  eventTime: {
    fontSize: '14px',
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  eventAction: {
    fontSize: '16px',
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  eventTeamInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '6px',
  },
  eventTeamIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '5px',
    marginRight: '8px',
  },
  eventTeamName: {
    fontSize: '14px',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  eventPosition: {
    fontSize: '11px',
    color: '#888',
  },
};

export default AnalysisPage;
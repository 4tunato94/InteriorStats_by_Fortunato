import React, { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';

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

const ActionsPage: React.FC = () => {
  const [actions, setActions] = useState<GameAction[]>([
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
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionName, setActionName] = useState('');
  const [actionEmoji, setActionEmoji] = useState('');
  const [actionSetup, setActionSetup] = useState<ActionSetup>({
    changePossession: false,
    requiresPlayer: false,
    reverseAction: false,
    multiplePlayer: false,
    teamChange: false,
  });

  const commonEmojis = ['⚽', '🟨', '🟥', '🔄', '🥅', '⛳', '🏃', '🤝', '💪', '🎯'];

  const addAction = () => {
    if (!actionName.trim()) {
      alert('Digite o nome da ação');
      return;
    }
    if (!actionEmoji.trim()) {
      alert('Selecione um emoji para a ação');
      return;
    }

    const newAction: GameAction = {
      id: Date.now().toString(),
      name: actionName.trim(),
      emoji: actionEmoji,
      setup: { ...actionSetup },
    };

    setActions([...actions, newAction]);
    resetForm();
  };

  const editAction = (id: string) => {
    const action = actions.find(a => a.id === id);
    if (action) {
      setActionName(action.name);
      setActionEmoji(action.emoji);
      setActionSetup({ ...action.setup });
      setEditingId(id);
    }
  };

  const saveEdit = () => {
    if (!actionName.trim()) {
      alert('Digite o nome da ação');
      return;
    }
    if (!actionEmoji.trim()) {
      alert('Selecione um emoji para a ação');
      return;
    }

    setActions(actions.map(action => 
      action.id === editingId 
        ? { ...action, name: actionName.trim(), emoji: actionEmoji, setup: { ...actionSetup } }
        : action
    ));
    
    resetForm();
  };

  const deleteAction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ação?')) {
      setActions(actions.filter(action => action.id !== id));
    }
  };

  const resetForm = () => {
    setActionName('');
    setActionEmoji('');
    setActionSetup({
      changePossession: false,
      requiresPlayer: false,
      reverseAction: false,
      multiplePlayer: false,
      teamChange: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const updateSetup = (key: keyof ActionSetup, value: boolean) => {
    setActionSetup(prev => ({ ...prev, [key]: value }));
  };

  const getActiveSetups = (setup: ActionSetup) => {
    const active = [];
    if (setup.changePossession) active.push('Muda Posse');
    if (setup.requiresPlayer) active.push('Requer Jogador');
    if (setup.reverseAction) active.push('Ação Reversa');
    if (setup.multiplePlayer) active.push('Múltiplos Jogadores');
    if (setup.teamChange) active.push('Mudança no Time');
    return active;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Cadastro de Ações</h1>
        <button style={styles.addButton} onClick={() => setIsAdding(true)}>
          <Plus size={24} color="#FFFFFF" />
        </button>
      </div>

      {(isAdding || editingId) && (
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>
            {editingId ? 'Editar Ação' : 'Nova Ação'}
          </h2>
          
          <input
            style={styles.input}
            placeholder="Nome da ação"
            value={actionName}
            onChange={(e) => setActionName(e.target.value)}
          />

          <p style={styles.label}>Emoji da Ação</p>
          <div style={styles.emojiContainer}>
            <input
              style={styles.emojiInput}
              placeholder="Emoji"
              value={actionEmoji}
              onChange={(e) => setActionEmoji(e.target.value)}
            />
            <div style={styles.emojiPicker}>
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  style={{
                    ...styles.emojiOption,
                    ...(actionEmoji === emoji ? styles.selectedEmoji : {}),
                  }}
                  onClick={() => setActionEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <p style={styles.label}>Configurações da Ação</p>
          
          <div style={styles.setupContainer}>
            {[
              { key: 'changePossession', title: 'Muda posse automaticamente', desc: 'Ao confirmar, a posse vai para o outro time' },
              { key: 'requiresPlayer', title: 'Requer seleção de jogador', desc: 'Deve selecionar um jogador titular do time' },
              { key: 'reverseAction', title: 'Ação reversa (time adversário)', desc: 'Registra ação no time que não está selecionado' },
              { key: 'multiplePlayer', title: 'Ação de mais de um jogador', desc: 'Para substituições - seleciona reserva e titular' },
              { key: 'teamChange', title: 'Mudança no time', desc: 'Altera configurações do time (capitão, goleiro, etc.)' },
            ].map(({ key, title, desc }) => (
              <div key={key} style={styles.setupItem}>
                <div style={styles.setupInfo}>
                  <p style={styles.setupTitle}>{title}</p>
                  <p style={styles.setupDescription}>{desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={actionSetup[key as keyof ActionSetup]}
                  onChange={(e) => updateSetup(key as keyof ActionSetup, e.target.checked)}
                  style={styles.checkbox}
                />
              </div>
            ))}
          </div>

          <div style={styles.formButtons}>
            <button style={styles.cancelButton} onClick={resetForm}>
              Cancelar
            </button>
            <button style={styles.saveButton} onClick={editingId ? saveEdit : addAction}>
              {editingId ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      <div style={styles.actionsList}>
        {actions.map((action) => (
          <div key={action.id} style={styles.actionItem}>
            <div style={styles.actionHeader}>
              <div style={styles.actionInfo}>
                <span style={styles.actionEmoji}>{action.emoji}</span>
                <span style={styles.actionName}>{action.name}</span>
              </div>
              
              <div style={styles.actionActions}>
                <button style={styles.actionButton} onClick={() => editAction(action.id)}>
                  <Edit3 size={16} color="#4CAF50" />
                </button>
                <button style={styles.actionButton} onClick={() => deleteAction(action.id)}>
                  <Trash2 size={16} color="#F44336" />
                </button>
              </div>
            </div>

            <div style={styles.setupTags}>
              {getActiveSetups(action.setup).map((setup) => (
                <div key={setup} style={styles.setupTag}>
                  <span style={styles.setupTagText}>{setup}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
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
    maxHeight: '75%',
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
    border: 'none',
  },
  label: {
    fontSize: '16px',
    color: '#FFFFFF',
    marginBottom: '10px',
    fontWeight: '600',
  },
  emojiContainer: {
    marginBottom: '20px',
  },
  emojiInput: {
    backgroundColor: '#333',
    color: '#FFFFFF',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '24px',
    textAlign: 'center' as const,
    marginBottom: '10px',
    width: '100%',
    border: 'none',
  },
  emojiPicker: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  emojiOption: {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    backgroundColor: '#333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '24px',
  },
  selectedEmoji: {
    borderColor: '#4CAF50',
  },
  setupContainer: {
    marginBottom: '20px',
  },
  setupItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #333',
  },
  setupInfo: {
    flex: 1,
    marginRight: '15px',
  },
  setupTitle: {
    fontSize: '16px',
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: '4px',
  },
  setupDescription: {
    fontSize: '14px',
    color: '#888',
    lineHeight: '18px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    accentColor: '#4CAF50',
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
  actionsList: {
    flex: 1,
    padding: '20px 40px',
    overflow: 'auto',
  },
  actionItem: {
    backgroundColor: '#1e1e1e',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '10px',
    border: '1px solid #333',
  },
  actionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  actionInfo: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  actionEmoji: {
    fontSize: '24px',
    marginRight: '12px',
  },
  actionName: {
    fontSize: '16px',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionActions: {
    display: 'flex',
    gap: '10px',
  },
  actionButton: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  setupTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  setupTag: {
    backgroundColor: '#4CAF50',
    padding: '4px 8px',
    borderRadius: '12px',
  },
  setupTagText: {
    fontSize: '12px',
    color: '#FFFFFF',
    fontWeight: '600',
  },
};

export default ActionsPage;
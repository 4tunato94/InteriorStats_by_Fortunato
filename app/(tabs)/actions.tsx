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
  Switch,
} from 'react-native';
import { Plus, CreditCard as Edit3, Trash2, Settings } from 'lucide-react-native';

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

export default function ActionsScreen() {
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
      Alert.alert('Erro', 'Digite o nome da ação');
      return;
    }
    if (!actionEmoji.trim()) {
      Alert.alert('Erro', 'Selecione um emoji para a ação');
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
      Alert.alert('Erro', 'Digite o nome da ação');
      return;
    }
    if (!actionEmoji.trim()) {
      Alert.alert('Erro', 'Selecione um emoji para a ação');
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
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta ação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => setActions(actions.filter(action => action.id !== id)),
        },
      ]
    );
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cadastro de Ações</Text>
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
            {editingId ? 'Editar Ação' : 'Nova Ação'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nome da ação"
            placeholderTextColor="#888"
            value={actionName}
            onChangeText={setActionName}
          />

          <Text style={styles.label}>Emoji da Ação</Text>
          <View style={styles.emojiContainer}>
            <TextInput
              style={styles.emojiInput}
              placeholder="Emoji"
              placeholderTextColor="#888"
              value={actionEmoji}
              onChangeText={setActionEmoji}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiPicker}>
              {commonEmojis.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiOption,
                    actionEmoji === emoji && styles.selectedEmoji
                  ]}
                  onPress={() => setActionEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text style={styles.label}>Configurações da Ação</Text>
          
          <View style={styles.setupContainer}>
            <View style={styles.setupItem}>
              <View style={styles.setupInfo}>
                <Text style={styles.setupTitle}>Muda posse automaticamente</Text>
                <Text style={styles.setupDescription}>
                  Ao confirmar, a posse vai para o outro time
                </Text>
              </View>
              <Switch
                value={actionSetup.changePossession}
                onValueChange={(value) => updateSetup('changePossession', value)}
                trackColor={{ false: '#333', true: '#4CAF50' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.setupItem}>
              <View style={styles.setupInfo}>
                <Text style={styles.setupTitle}>Requer seleção de jogador</Text>
                <Text style={styles.setupDescription}>
                  Deve selecionar um jogador titular do time
                </Text>
              </View>
              <Switch
                value={actionSetup.requiresPlayer}
                onValueChange={(value) => updateSetup('requiresPlayer', value)}
                trackColor={{ false: '#333', true: '#4CAF50' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.setupItem}>
              <View style={styles.setupInfo}>
                <Text style={styles.setupTitle}>Ação reversa (time adversário)</Text>
                <Text style={styles.setupDescription}>
                  Registra ação no time que não está selecionado
                </Text>
              </View>
              <Switch
                value={actionSetup.reverseAction}
                onValueChange={(value) => updateSetup('reverseAction', value)}
                trackColor={{ false: '#333', true: '#4CAF50' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.setupItem}>
              <View style={styles.setupInfo}>
                <Text style={styles.setupTitle}>Ação de mais de um jogador</Text>
                <Text style={styles.setupDescription}>
                  Para substituições - seleciona reserva e titular
                </Text>
              </View>
              <Switch
                value={actionSetup.multiplePlayer}
                onValueChange={(value) => updateSetup('multiplePlayer', value)}
                trackColor={{ false: '#333', true: '#4CAF50' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.setupItem}>
              <View style={styles.setupInfo}>
                <Text style={styles.setupTitle}>Mudança no time</Text>
                <Text style={styles.setupDescription}>
                  Altera configurações do time (capitão, goleiro, etc.)
                </Text>
              </View>
              <Switch
                value={actionSetup.teamChange}
                onValueChange={(value) => updateSetup('teamChange', value)}
                trackColor={{ false: '#333', true: '#4CAF50' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={editingId ? saveEdit : addAction}
            >
              <Text style={styles.saveButtonText}>
                {editingId ? 'Salvar' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <ScrollView style={styles.actionsList}>
        {actions.map((action) => (
          <View key={action.id} style={styles.actionItem}>
            <View style={styles.actionHeader}>
              <View style={styles.actionInfo}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Text style={styles.actionName}>{action.name}</Text>
              </View>
              
              <View style={styles.actionActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => editAction(action.id)}
                >
                  <Edit3 size={16} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteAction(action.id)}
                >
                  <Trash2 size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.setupTags}>
              {getActiveSetups(action.setup).map((setup) => (
                <View key={setup} style={styles.setupTag}>
                  <Text style={styles.setupTagText}>{setup}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
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
    maxHeight: '75%',
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
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '600',
  },
  emojiContainer: {
    marginBottom: 20,
  },
  emojiInput: {
    backgroundColor: '#333',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
  },
  emojiPicker: {
    maxHeight: 60,
  },
  emojiOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEmoji: {
    borderColor: '#4CAF50',
  },
  emojiText: {
    fontSize: 24,
  },
  setupContainer: {
    marginBottom: 20,
  },
  setupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  setupInfo: {
    flex: 1,
    marginRight: 15,
  },
  setupTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  setupDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 18,
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
  actionsList: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  actionItem: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  actionName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
  },
  setupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  setupTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  setupTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
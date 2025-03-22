import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Task, SubTask, TaskPriority, PriorityColors } from './types';

interface TaskBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task: Task | null;
}

export default function TaskBreakdownModal({
  visible,
  onClose,
  onSave,
  task,
}: TaskBreakdownModalProps) {
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState('');
  
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    text: isDark ? Colors.dark.text : Colors.light.text,
    subText: isDark ? '#9BA1A6' : '#687076',
    inputBackground: isDark ? '#1C1C1E' : '#FFFFFF',
    inputBorder: isDark ? '#38383A' : '#E1E1E1',
    buttonPrimary: Colors.light.tint,
    buttonText: '#FFFFFF',
    buttonSecondary: isDark ? '#38383A' : '#E1E1E1',
    buttonSecondaryText: isDark ? Colors.dark.text : Colors.light.text,
    modalBackground: isDark ? '#1C1C1E' : '#FFFFFF',
    checkboxBorder: isDark ? '#9BA1A6' : '#687076',
    checkboxFill: isDark ? Colors.dark.tint : Colors.light.tint,
    border: isDark ? '#38383A' : '#E1E1E1', // Add border color for reorder buttons
  };

  // Reset state when modal becomes visible or task changes
  useEffect(() => {
    if (visible && task) {
      setSubtasks(task.subtasks || []);
      setGenerationPrompt(`Break down the task "${task.title}" into smaller, manageable steps.`);
    }
  }, [visible, task]);

  // Handle adding a new subtask manually
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    const newSubtask: SubTask = {
      id: Date.now().toString(),
      title: newSubtaskTitle.trim(),
      completed: false,
      order: subtasks.length, // Add order property based on current length
    };
    
    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  // Handle toggling subtask completion
  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map(subtask => 
        subtask.id === id 
          ? { ...subtask, completed: !subtask.completed } 
          : subtask
      )
    );
  };

  // Handle editing subtask title
  const handleEditSubtask = (id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      handleDeleteSubtask(id);
      return;
    }
    
    setSubtasks(
      subtasks.map(subtask => 
        subtask.id === id 
          ? { ...subtask, title: newTitle.trim() } 
          : subtask
      )
    );
  };
  
  // Handle updating subtask priority
  const handleUpdateSubtaskPriority = (id: string, priority: TaskPriority) => {
    setSubtasks(
      subtasks.map(subtask => 
        subtask.id === id 
          ? { ...subtask, priority } 
          : subtask
      )
    );
  };
  
  // Handle updating subtask time estimate
  const handleUpdateSubtaskTimeEstimate = (id: string, timeEstimate: number) => {
    setSubtasks(
      subtasks.map(subtask => 
        subtask.id === id 
          ? { ...subtask, timeEstimate } 
          : subtask
      )
    );
  };
  
  // Handle moving subtask up in the order
  const handleMoveSubtaskUp = (id: string) => {
    const index = subtasks.findIndex(subtask => subtask.id === id);
    if (index <= 0) return; // Already at the top
    
    const newSubtasks = [...subtasks];
    const temp = newSubtasks[index];
    newSubtasks[index] = newSubtasks[index - 1];
    newSubtasks[index - 1] = temp;
    
    // Update order property for all subtasks
    const updatedSubtasks = newSubtasks.map((subtask, idx) => ({
      ...subtask,
      order: idx
    }));
    
    setSubtasks(updatedSubtasks);
  };
  
  // Handle moving subtask down in the order
  const handleMoveSubtaskDown = (id: string) => {
    const index = subtasks.findIndex(subtask => subtask.id === id);
    if (index === -1 || index >= subtasks.length - 1) return; // Already at the bottom
    
    const newSubtasks = [...subtasks];
    const temp = newSubtasks[index];
    newSubtasks[index] = newSubtasks[index + 1];
    newSubtasks[index + 1] = temp;
    
    // Update order property for all subtasks
    const updatedSubtasks = newSubtasks.map((subtask, idx) => ({
      ...subtask,
      order: idx
    }));
    
    setSubtasks(updatedSubtasks);
  };

  // Handle deleting a subtask
  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== id));
  };

  // Handle saving the task with updated subtasks
  const handleSave = () => {
    if (!task) return;
    
    const updatedTask: Task = {
      ...task,
      subtasks,
    };
    
    onSave(updatedTask);
    onClose();
  };

  // Mock function to simulate Ollama API call
  const generateSubtasksWithOllama = async () => {
    if (!task) return;
    
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would be an API call to Ollama
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate subtasks based on the task type
      let generatedSubtasks: SubTask[] = [];
      
      if (task.title.toLowerCase().includes('project')) {
        generatedSubtasks = [
          { id: `gen-${Date.now()}-1`, title: 'Research and gather information', completed: false, order: subtasks.length },
          { id: `gen-${Date.now()}-2`, title: 'Create project outline', completed: false, order: subtasks.length + 1 },
          { id: `gen-${Date.now()}-3`, title: 'Draft initial content', completed: false, order: subtasks.length + 2 },
          { id: `gen-${Date.now()}-4`, title: 'Review and revise', completed: false, order: subtasks.length + 3 },
          { id: `gen-${Date.now()}-5`, title: 'Finalize and submit', completed: false, order: subtasks.length + 4 },
        ];
      } else if (task.title.toLowerCase().includes('presentation')) {
        generatedSubtasks = [
          { id: `gen-${Date.now()}-1`, title: 'Define presentation goals and audience', completed: false, order: subtasks.length },
          { id: `gen-${Date.now()}-2`, title: 'Create outline and structure', completed: false, order: subtasks.length + 1 },
          { id: `gen-${Date.now()}-3`, title: 'Design slides', completed: false, order: subtasks.length + 2 },
          { id: `gen-${Date.now()}-4`, title: 'Practice delivery', completed: false, order: subtasks.length + 3 },
          { id: `gen-${Date.now()}-5`, title: 'Gather feedback and revise', completed: false, order: subtasks.length + 4 },
        ];
      } else if (task.title.toLowerCase().includes('essay') || task.title.toLowerCase().includes('paper')) {
        generatedSubtasks = [
          { id: `gen-${Date.now()}-1`, title: 'Research topic and gather sources', completed: false, order: subtasks.length },
          { id: `gen-${Date.now()}-2`, title: 'Create thesis statement and outline', completed: false, order: subtasks.length + 1 },
          { id: `gen-${Date.now()}-3`, title: 'Write first draft', completed: false, order: subtasks.length + 2 },
          { id: `gen-${Date.now()}-4`, title: 'Edit for content and structure', completed: false, order: subtasks.length + 3 },
          { id: `gen-${Date.now()}-5`, title: 'Proofread for grammar and spelling', completed: false, order: subtasks.length + 4 },
          { id: `gen-${Date.now()}-6`, title: 'Format citations and bibliography', completed: false, order: subtasks.length + 5 },
        ];
      } else {
        // Generic subtasks for any other type of task
        generatedSubtasks = [
          { id: `gen-${Date.now()}-1`, title: 'Define specific goals and outcomes', completed: false, order: subtasks.length },
          { id: `gen-${Date.now()}-2`, title: 'Break down into smaller steps', completed: false, order: subtasks.length + 1 },
          { id: `gen-${Date.now()}-3`, title: 'Allocate time for each step', completed: false, order: subtasks.length + 2 },
          { id: `gen-${Date.now()}-4`, title: 'Gather necessary resources', completed: false, order: subtasks.length + 3 },
          { id: `gen-${Date.now()}-5`, title: 'Set checkpoints for progress review', completed: false, order: subtasks.length + 4 },
        ];
      }
      
      // Merge with existing subtasks, avoiding duplicates
      const existingTitles = subtasks.map(st => st.title.toLowerCase());
      const newSubtasks = generatedSubtasks.filter(
        st => !existingTitles.includes(st.title.toLowerCase())
      );
      
      setSubtasks([...subtasks, ...newSubtasks]);
      
      Alert.alert(
        'Subtasks Generated',
        'Ollama has suggested some subtasks based on your task. Feel free to edit or remove them as needed.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Generation Failed',
        'Failed to generate subtasks. Please try again or add them manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Render a subtask item
  const renderSubtaskItem = (subtask: SubTask, index: number) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(subtask.title);
    const [showDetails, setShowDetails] = useState(false);
    const [timeEstimate, setTimeEstimate] = useState(subtask.timeEstimate?.toString() || '');
    const [priority, setPriority] = useState<TaskPriority | undefined>(subtask.priority);
    
    return (
      <View key={subtask.id}>
        <View style={styles.subtaskItem}>
          {/* Reorder buttons */}
          <View style={styles.reorderButtons}>
            <TouchableOpacity
              style={[styles.reorderButton, index === 0 && styles.disabledButton]}
              onPress={() => handleMoveSubtaskUp(subtask.id)}
              disabled={index === 0}
            >
              <Ionicons 
                name="chevron-up" 
                size={16} 
                color={index === 0 ? themeColors.border : themeColors.subText} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reorderButton, index === subtasks.length - 1 && styles.disabledButton]}
              onPress={() => handleMoveSubtaskDown(subtask.id)}
              disabled={index === subtasks.length - 1}
            >
              <Ionicons 
                name="chevron-down" 
                size={16} 
                color={index === subtasks.length - 1 ? themeColors.border : themeColors.subText} 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleToggleSubtask(subtask.id)}
          >
            <Ionicons
              name={subtask.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={subtask.completed ? themeColors.checkboxFill : themeColors.checkboxBorder}
            />
          </TouchableOpacity>
          
          {isEditing ? (
            <TextInput
              style={[
                styles.subtaskInput,
                { 
                  backgroundColor: themeColors.inputBackground,
                  borderColor: themeColors.inputBorder,
                  color: themeColors.text,
                },
              ]}
              value={editedTitle}
              onChangeText={setEditedTitle}
              autoFocus
              onBlur={() => {
                handleEditSubtask(subtask.id, editedTitle);
                setIsEditing(false);
              }}
              onSubmitEditing={() => {
                handleEditSubtask(subtask.id, editedTitle);
                setIsEditing(false);
              }}
            />
          ) : (
            <TouchableOpacity
              style={styles.subtaskTextContainer}
              onPress={() => {
                setEditedTitle(subtask.title);
                setIsEditing(true);
              }}
            >
              <Text
                style={[
                  styles.subtaskText,
                  { color: themeColors.text },
                  subtask.completed && styles.completedText,
                ]}
              >
                {subtask.title}
                {subtask.timeEstimate && (
                  <Text style={[styles.subtaskDetail, { color: themeColors.subText }]}>
                    {' '}({subtask.timeEstimate} min)
                  </Text>
                )}
                {subtask.priority && (
                  <Text style={[
                    styles.subtaskDetail, 
                    { color: PriorityColors[subtask.priority] }
                  ]}>
                    {' '}• {subtask.priority}
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.subtaskActions}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => setShowDetails(!showDetails)}
            >
              <Ionicons 
                name={showDetails ? 'chevron-up-circle-outline' : 'chevron-down-circle-outline'} 
                size={20} 
                color={themeColors.subText} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteSubtask(subtask.id)}
            >
              <Ionicons name="trash-outline" size={20} color={themeColors.subText} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Expanded details section */}
        {showDetails && (
          <View style={[styles.subtaskDetails, { backgroundColor: themeColors.inputBackground }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: themeColors.text }]}>Priority:</Text>
              <View style={styles.priorityButtons}>
                {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      {
                        backgroundColor: priority === p ? PriorityColors[p] : 'transparent',
                        borderColor: PriorityColors[p],
                      },
                    ]}
                    onPress={() => {
                      setPriority(p);
                      handleUpdateSubtaskPriority(subtask.id, p);
                    }}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: priority === p ? '#FFFFFF' : PriorityColors[p] },
                      ]}
                    >
                      {p.charAt(0).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: themeColors.text }]}>Time estimate:</Text>
              <View style={styles.timeEstimateContainer}>
                <TextInput
                  style={[
                    styles.timeEstimateInput,
                    { 
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.inputBorder,
                      color: themeColors.text,
                    },
                  ]}
                  value={timeEstimate}
                  onChangeText={setTimeEstimate}
                  placeholder="0"
                  placeholderTextColor={themeColors.subText}
                  keyboardType="number-pad"
                  onBlur={() => {
                    const estimate = parseInt(timeEstimate);
                    if (!isNaN(estimate) && estimate > 0) {
                      handleUpdateSubtaskTimeEstimate(subtask.id, estimate);
                    } else {
                      setTimeEstimate(subtask.timeEstimate?.toString() || '');
                    }
                  }}
                />
                <Text style={[styles.timeEstimateUnit, { color: themeColors.text }]}>minutes</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: themeColors.modalBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              Break Down Task
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: themeColors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {task && (
              <View style={styles.taskInfoContainer}>
                <Text style={[styles.taskTitle, { color: themeColors.text }]}>
                  {task.title}
                </Text>
                {task.description && (
                  <Text style={[styles.taskDescription, { color: themeColors.subText }]}>
                    {task.description}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.generationContainer}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Generate Subtasks with Ollama
              </Text>
              <TextInput
                style={[
                  styles.promptInput,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text,
                  },
                ]}
                value={generationPrompt}
                onChangeText={setGenerationPrompt}
                placeholder="Enter a prompt for Ollama"
                placeholderTextColor={themeColors.subText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  { backgroundColor: themeColors.buttonPrimary },
                  isGenerating && { opacity: 0.7 },
                ]}
                onPress={generateSubtasksWithOllama}
                disabled={isGenerating || !generationPrompt.trim()}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={[styles.generateButtonText, { color: themeColors.buttonText }]}>
                    Generate with Ollama
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.subtasksContainer}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Subtasks
              </Text>
              
              <View style={styles.addSubtaskContainer}>
                <TextInput
                  style={[
                    styles.addSubtaskInput,
                    {
                      backgroundColor: themeColors.inputBackground,
                      borderColor: themeColors.inputBorder,
                      color: themeColors.text,
                    },
                  ]}
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  placeholder="Add a new subtask"
                  placeholderTextColor={themeColors.subText}
                  onSubmitEditing={handleAddSubtask}
                />
                <TouchableOpacity
                  style={[
                    styles.addSubtaskButton,
                    { backgroundColor: themeColors.buttonPrimary },
                  ]}
                  onPress={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim()}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.subtasksList}>
                {subtasks.length === 0 ? (
                  <Text style={[styles.emptyText, { color: themeColors.subText }]}>
                    No subtasks yet. Add some manually or generate with Ollama.
                  </Text>
                ) : (
                  subtasks.map(renderSubtaskItem)
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: themeColors.buttonSecondary }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: themeColors.buttonSecondaryText }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: themeColors.buttonPrimary }]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: themeColors.buttonText }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    maxHeight: '70%',
  },
  taskInfoContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
  },
  generationContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 80,
  },
  generateButton: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtasksContainer: {
    marginBottom: 16,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addSubtaskInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addSubtaskButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtasksList: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reorderButtons: {
    flexDirection: 'column',
    marginRight: 4,
  },
  reorderButton: {
    padding: 4,
  },
  disabledButton: {
    opacity: 0.3,
  },
  checkbox: {
    marginRight: 8,
  },
  subtaskTextContainer: {
    flex: 1,
    paddingVertical: 4,
  },
  subtaskText: {
    fontSize: 16,
  },
  subtaskDetail: {
    fontSize: 12,
  },
  subtaskInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  subtaskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  subtaskDetails: {
    marginLeft: 36,
    marginRight: 8,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityButtons: {
    flexDirection: 'row',
  },
  priorityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeEstimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeEstimateInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  timeEstimateUnit: {
    marginLeft: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#E1E1E1',
  },
  saveButton: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
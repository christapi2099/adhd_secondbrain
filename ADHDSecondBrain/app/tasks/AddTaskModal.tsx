import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  useColorScheme,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskPriority, CheckInFrequency, PriorityColors } from './types';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  onDelete?: (taskId: string) => void;
  initialDate?: Date;
  editTask?: Task | null;
}

export default function AddTaskModal({
  visible,
  onClose,
  onSave,
  onDelete,
  initialDate = new Date(),
  editTask,
}: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(initialDate);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [checkInFrequency, setCheckInFrequency] = useState<CheckInFrequency>('none');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
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
    deleteButton: '#FF3B30',
  };

  // Reset form when modal becomes visible or editTask changes
  useEffect(() => {
    if (visible) {
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description || '');
        setDueDate(new Date(editTask.dueDate));
        setPriority(editTask.priority);
        setCheckInFrequency(editTask.checkInFrequency);
      } else {
        setTitle('');
        setDescription('');
        setDueDate(initialDate);
        setPriority('medium');
        setCheckInFrequency('none');
      }
    }
  }, [visible, editTask, initialDate]);

  const handleSave = () => {
    if (!title.trim()) {
      // Show error - title is required
      return;
    }

    const taskData: Omit<Task, 'id'> = {
      title,
      description: description.trim() ? description : undefined,
      dueDate,
      priority,
      completed: editTask ? editTask.completed : false,
      checkInFrequency,
      subtasks: editTask?.subtasks,
    };

    onSave(taskData);
    onClose();
  };

  const handleDelete = () => {
    if (editTask && onDelete) {
      onDelete(editTask.id);
      onClose();
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };
  
  // Generate calendar days for the current month view
  const generateCalendarDays = (): Date[] => {
    const monthStart = startOfMonth(dueDate);
    const monthEnd = endOfMonth(dueDate);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);
    
    // Start from the first day of the week (Sunday)
    const day = getDay(startDate);
    startDate.setDate(startDate.getDate() - day);
    
    // End on the last day of the week
    const endDay = getDay(endDate);
    endDate.setDate(endDate.getDate() + (6 - endDay));
    
    return eachDayOfInterval({ start: startDate, end: endDate });
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
              {editTask ? 'Edit Task' : 'Add New Task'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: themeColors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Title *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Task title"
                placeholderTextColor={themeColors.subText}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Description</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Task description"
                placeholderTextColor={themeColors.subText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Due Date</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { backgroundColor: themeColors.inputBackground, borderColor: themeColors.inputBorder },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateText, { color: themeColors.text }]}>
                  {format(dueDate, 'EEEE, MMMM d, yyyy')}
                </Text>
              </TouchableOpacity>
              
              {/* Calendar Widget */}
              {showDatePicker && Platform.OS === 'ios' && (
                <View style={[styles.calendarContainer, { backgroundColor: themeColors.inputBackground, borderColor: themeColors.inputBorder }]}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => setDueDate(prevDate => subMonths(prevDate, 1))}>
                      <Ionicons name="chevron-back" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.calendarMonthText, { color: themeColors.text }]}>
                      {format(dueDate, 'MMMM yyyy')}
                    </Text>
                    <TouchableOpacity onPress={() => setDueDate(prevDate => addMonths(prevDate, 1))}>
                      <Ionicons name="chevron-forward" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.weekdayHeader}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <Text key={index} style={[styles.weekdayText, { color: themeColors.subText }]}>
                        {day}
                      </Text>
                    ))}
                  </View>
                  
                  <View style={styles.calendarGrid}>
                    {generateCalendarDays().map((date: Date, index: number) => {
                      const isCurrentMonth = isSameMonth(date, dueDate);
                      const isSelected = isSameDay(date, dueDate);
                      const isToday = isSameDay(date, new Date());
                      
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.calendarDay,
                            isSelected && { backgroundColor: themeColors.buttonPrimary },
                            !isCurrentMonth && { opacity: 0.3 }
                          ]}
                          onPress={() => {
                            // Preserve the time from the current dueDate
                            const newDate = new Date(date);
                            newDate.setHours(
                              dueDate.getHours(),
                              dueDate.getMinutes(),
                              dueDate.getSeconds()
                            );
                            setDueDate(newDate);
                            setShowDatePicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.calendarDayText,
                              { color: themeColors.text },
                              isSelected && { color: '#FFFFFF' },
                              isToday && !isSelected && { fontWeight: 'bold', color: themeColors.buttonPrimary }
                            ]}
                          >
                            {format(date, 'd')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  
                  <View style={styles.calendarActions}>
                    <TouchableOpacity
                      style={[styles.calendarButton, { backgroundColor: themeColors.buttonSecondary }]}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={[styles.calendarButtonText, { color: themeColors.buttonSecondaryText }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.calendarButton, { backgroundColor: themeColors.buttonPrimary }]}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={[styles.calendarButtonText, { color: themeColors.buttonText }]}>
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Priority</Text>
              <View style={styles.priorityContainer}>
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
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: priority === p ? '#FFFFFF' : PriorityColors[p] },
                      ]}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Check-in Frequency</Text>
              <View style={styles.checkInContainer}>
                {(['daily', 'weekly', 'none'] as CheckInFrequency[]).map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.checkInButton,
                      {
                        backgroundColor: checkInFrequency === freq ? themeColors.buttonPrimary : 'transparent',
                        borderColor: themeColors.buttonPrimary,
                      },
                    ]}
                    onPress={() => setCheckInFrequency(freq)}
                  >
                    <Text
                      style={[
                        styles.checkInText,
                        { color: checkInFrequency === freq ? '#FFFFFF' : themeColors.buttonPrimary },
                      ]}
                    >
                      {freq === 'none' ? 'None' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              {editTask && onDelete && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: themeColors.deleteButton }]}
                  onPress={handleDelete}
                >
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}
              
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
          </ScrollView>

          {/* Use native date picker for Android */}
          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
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
    maxHeight: '80%',
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
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    fontSize: 16,
    minHeight: 100,
  },
  dateButton: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 16,
  },
  calendarContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    zIndex: 1000,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarMonthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%', // 7 days per week
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  calendarDayText: {
    fontSize: 14,
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  calendarButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  calendarButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  priorityText: {
    fontWeight: '500',
  },
  checkInContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkInButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  checkInText: {
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
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
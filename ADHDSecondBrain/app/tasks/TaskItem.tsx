import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors } from '@/constants/Colors';

// Import types from tasks types file
import { Task, TaskPriority, SubTask, PriorityColors } from './types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onBreakdown: (task: Task) => void;
}

export default function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onBreakdown,
}: TaskItemProps) {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    text: isDark ? Colors.dark.text : Colors.light.text,
    subText: isDark ? '#9BA1A6' : '#687076',
    cardBackground: isDark ? '#2C2C2E' : '#FFFFFF',
    border: isDark ? '#38383A' : '#E1E1E1',
    checkboxBorder: isDark ? '#9BA1A6' : '#687076',
    checkboxFill: isDark ? Colors.dark.tint : Colors.light.tint,
  };

  // Format the due date
  const formatDueDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  // Calculate if task is overdue
  const isOverdue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return !task.completed && dueDate < today;
  };

  // Calculate progress percentage based on completed subtasks
  const calculateProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    
    const completedCount = task.subtasks.filter(subtask => subtask.completed).length;
    return (completedCount / task.subtasks.length) * 100;
  };

  // Render subtasks if they exist
  const renderSubtasks = () => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    
    // Calculate progress
    const progress = calculateProgress();
    
    return (
      <View style={styles.subtasksContainer}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: themeColors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: PriorityColors[task.priority],
                  width: `${progress}%` 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: themeColors.subText }]}>
            {Math.round(progress)}% complete
          </Text>
        </View>
        
        {task.subtasks.map((subtask) => (
          <View key={subtask.id} style={styles.subtaskItem}>
            <Ionicons
              name={subtask.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={subtask.completed ? themeColors.checkboxFill : themeColors.checkboxBorder}
            />
            <Text
              style={[
                styles.subtaskText,
                { color: themeColors.subText },
                subtask.completed && styles.completedText,
              ]}
            >
              {subtask.title}
              {subtask.timeEstimate && (
                <Text style={[styles.subtaskEstimate, { color: themeColors.subText }]}>
                  {' '}({subtask.timeEstimate} min)
                </Text>
              )}
              {subtask.priority && (
                <Text style={[
                  styles.subtaskPriority, 
                  { color: PriorityColors[subtask.priority] }
                ]}>
                  {' '}• {subtask.priority}
                </Text>
              )}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: themeColors.cardBackground,
          borderLeftColor: PriorityColors[task.priority],
        },
        task.completed && styles.completedTask,
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => onToggleComplete(task.id)}
        >
          <Ionicons
            name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={task.completed ? themeColors.checkboxFill : themeColors.checkboxBorder}
          />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              { color: themeColors.text },
              task.completed && styles.completedText,
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          
          {task.description && (
            <Text
              style={[
                styles.description,
                { color: themeColors.subText },
                task.completed && styles.completedText,
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.dueDateContainer}>
          <Ionicons name="calendar-outline" size={16} color={themeColors.subText} />
          <Text
            style={[
              styles.dueDate,
              { color: themeColors.subText },
              isOverdue() && styles.overdue,
            ]}
          >
            {formatDueDate(task.dueDate)}
            {isOverdue() && ' (Overdue)'}
          </Text>
        </View>
        
        {task.checkInFrequency !== 'none' && (
          <View style={styles.checkInContainer}>
            <Ionicons name="notifications-outline" size={16} color={themeColors.subText} />
            <Text style={[styles.checkInText, { color: themeColors.subText }]}>
              {task.checkInFrequency.charAt(0).toUpperCase() + task.checkInFrequency.slice(1)} check-in
            </Text>
          </View>
        )}
      </View>
      
      {renderSubtasks()}
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(task)}
        >
          <Ionicons name="create-outline" size={20} color={themeColors.subText} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onBreakdown(task)}
        >
          <Ionicons name="git-branch-outline" size={20} color={themeColors.subText} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(task.id)}
        >
          <Ionicons name="trash-outline" size={20} color={themeColors.subText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedTask: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 8,
    paddingTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  dueDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  overdue: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  checkInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInText: {
    fontSize: 12,
    marginLeft: 4,
  },
  subtasksContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 32,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subtaskText: {
    fontSize: 12,
    marginLeft: 4,
  },
  subtaskEstimate: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  subtaskPriority: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

// Import task types and components
import { Task } from '../tasks/types';
import TaskItem from '../tasks/TaskItem';
import AddTaskModal from '../tasks/AddTaskModal';
import TaskBreakdownModal from '../tasks/TaskBreakdownModal';

export default function TasksScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    text: isDark ? Colors.dark.text : Colors.light.text,
    tint: isDark ? Colors.dark.tint : Colors.light.tint,
    tabBackground: isDark ? '#2C2C2E' : '#f0f0f0',
    activeTab: isDark ? Colors.dark.tint : Colors.light.tint,
    inactiveTab: isDark ? '#9BA1A6' : '#687076',
    border: isDark ? '#38383A' : '#E1E1E1',
    card: isDark ? '#2C2C2E' : '#FFFFFF',
    buttonBackground: isDark ? Colors.dark.tint : Colors.light.tint,
    buttonText: isDark ? '#FFFFFF' : '#FFFFFF',
  };

  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showTaskBreakdownModal, setShowTaskBreakdownModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load mock tasks on initial render
  useEffect(() => {
    // In a real app, this would load from a database or API
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Complete project proposal',
        description: 'Finish the draft and send for review',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        priority: 'high',
        completed: false,
        checkInFrequency: 'daily',
        subtasks: [
          { id: '1-1', title: 'Research competitors', completed: true, order: 1 },
          { id: '1-2', title: 'Create outline', completed: true, order: 2 },
          { id: '1-3', title: 'Write first draft', completed: false, order: 3 },
          { id: '1-4', title: 'Review and edit', completed: false, order: 4 },
        ],
      },
      {
        id: '2',
        title: 'Schedule doctor appointment',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        priority: 'medium',
        completed: false,
        checkInFrequency: 'weekly',
      },
      {
        id: '3',
        title: 'Buy groceries',
        description: 'Get items for the week',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        priority: 'low',
        completed: false,
        checkInFrequency: 'none',
      },
    ];
    
    setTasks(mockTasks);
  }, []);

  // Handle adding a new task
  const handleAddTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
    };
    
    setTasks([...tasks, newTask]);
  };

  // Handle editing an existing task
  const handleEditTask = (taskData: Omit<Task, 'id'>) => {
    if (!selectedTask) return;
    
    const updatedTasks = tasks.map(task => 
      task.id === selectedTask.id 
        ? { ...taskData, id: task.id } 
        : task
    );
    
    setTasks(updatedTasks);
    setSelectedTask(null);
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Handle toggling task completion
  const handleToggleComplete = (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed } 
        : task
    );
    
    setTasks(updatedTasks);
  };

  // Open add task modal
  const handleAddTaskPress = () => {
    setSelectedTask(null);
    setShowAddTaskModal(true);
  };

  // Open edit task modal
  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowAddTaskModal(true);
  };

  // Open task breakdown modal
  const handleBreakdownPress = (task: Task) => {
    setSelectedTask(task);
    setShowTaskBreakdownModal(true);
  };

  // Update task with new subtasks
  const handleUpdateTaskWithSubtasks = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    
    setTasks(updatedTasks);
  };

  // Filter tasks based on active filter
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    return true;
  });

  // Sort tasks by due date and priority
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Then sort by due date
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    
    // Then sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Tasks</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: themeColors.buttonBackground }]}
          onPress={handleAddTaskPress}
        >
          <Ionicons name="add" size={24} color={themeColors.buttonText} />
        </TouchableOpacity>
      </View>

      <View style={[styles.filterContainer, { backgroundColor: themeColors.tabBackground }]}>
        <TouchableOpacity
          style={[
            styles.filterOption,
            activeFilter === 'all' && { backgroundColor: themeColors.activeTab }
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              { color: activeFilter === 'all' ? '#FFFFFF' : themeColors.inactiveTab }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterOption,
            activeFilter === 'active' && { backgroundColor: themeColors.activeTab }
          ]}
          onPress={() => setActiveFilter('active')}
        >
          <Text
            style={[
              styles.filterText,
              { color: activeFilter === 'active' ? '#FFFFFF' : themeColors.inactiveTab }
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterOption,
            activeFilter === 'completed' && { backgroundColor: themeColors.activeTab }
          ]}
          onPress={() => setActiveFilter('completed')}
        >
          <Text
            style={[
              styles.filterText,
              { color: activeFilter === 'completed' ? '#FFFFFF' : themeColors.inactiveTab }
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {sortedTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkbox-outline" size={64} color={themeColors.tint} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: themeColors.text }]}>
              {activeFilter === 'all' 
                ? 'No tasks yet. Add your first task!' 
                : activeFilter === 'active' 
                  ? 'No active tasks. Great job!' 
                  : 'No completed tasks yet.'}
            </Text>
          </View>
        ) : (
          sortedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={handleTaskPress}
              onDelete={handleDeleteTask}
              onBreakdown={handleBreakdownPress}
            />
          ))
        )}
      </ScrollView>

      {/* Add/Edit Task Modal */}
      <AddTaskModal
        visible={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onSave={selectedTask ? handleEditTask : handleAddTask}
        onDelete={selectedTask ? handleDeleteTask : undefined}
        initialDate={new Date()}
        editTask={selectedTask}
      />
      
      {/* Task Breakdown Modal */}
      <TaskBreakdownModal
        visible={showTaskBreakdownModal}
        onClose={() => setShowTaskBreakdownModal(false)}
        onSave={handleUpdateTaskWithSubtasks}
        task={selectedTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  filterOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
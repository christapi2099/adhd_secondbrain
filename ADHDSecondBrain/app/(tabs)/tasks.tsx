import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useStorage, useQuery, createObjectId, getCurrentTimestamp } from '@/app/storage';
import { TABLES, TaskEntity, SubTaskEntity } from '@/app/storage/database';

// Import task types and components
import { Task, SubTask, TaskPriority } from '../tasks/types';
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

  // Get Storage instance
  const storage = useStorage();
  
  // Query tasks from SQLite database
  const { results: sqliteTasks, isLoading } = useQuery(TABLES.TASK);
  
  // Load tasks from SQLite database
  useEffect(() => {
    if (!user || !storage.isReady || isLoading) return;
    
    const loadTasks = async () => {
      try {
        // Get tasks for the current user
        const userTasksQuery = await storage.getByFilter(TABLES.TASK, 'userId', user.id);
        
        // Convert to Task objects and load subtasks
        const userTasksWithSubtasks = await Promise.all(userTasksQuery.map(async (sqliteTask) => {
          const task = sqliteTask as TaskEntity;
          // Get subtasks for this task
          const subtasks = await storage.getSubtasks(task._id);
          
          // Convert SQLite object to plain JS object
          const taskObj: Task = {
            id: task._id,
            title: task.title,
            description: task.description,
            dueDate: new Date(task.dueDate),
            priority: task.priority as TaskPriority,
            completed: task.completed,
            checkInFrequency: task.checkInFrequency,
            subtasks: subtasks.length > 0 ? 
              subtasks.map((subtaskItem) => {
                const subTask = subtaskItem as SubTaskEntity;
                return {
                  id: subTask._id,
                  title: subTask.title,
                  completed: subTask.completed,
                  priority: subTask.priority as TaskPriority,
                  timeEstimate: subTask.timeEstimate,
                  orderIndex: subTask.orderIndex
                };
              }).sort((a, b) => a.orderIndex - b.orderIndex) :
              undefined
          };
          
          return taskObj;
        }));
        
        // Sort tasks
        const sortedTasks = userTasksWithSubtasks.sort((a, b) => {
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
        
        setTasks(sortedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        Alert.alert('Error', 'Failed to load tasks. Please try again.');
      }
    };
    
    loadTasks();
  }, [user, storage.isReady, isLoading, sqliteTasks]);

  // Handle adding a new task
  const handleAddTask = async (taskData: Omit<Task, 'id'>) => {
    if (!user || !storage.isReady) return;
    
    try {
      await storage.write(async () => {
        // Create the task first
        const taskId = createObjectId();
        await storage.create(TABLES.TASK, {
          _id: taskId,
          userId: user.id,
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate,
          priority: taskData.priority,
          completed: taskData.completed || false,
          checkInFrequency: taskData.checkInFrequency,
        } as Omit<TaskEntity, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string });
        
        // Create subtasks if they exist
        if (taskData.subtasks && taskData.subtasks.length > 0) {
          for (const subtask of taskData.subtasks) {
            await storage.create(TABLES.SUBTASK, {
              _id: createObjectId(),
              taskId: taskId,
              title: subtask.title,
              completed: subtask.completed,
              priority: subtask.priority,
              timeEstimate: subtask.timeEstimate,
              orderIndex: subtask.orderIndex,
            } as Omit<SubTaskEntity, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string });
          }
        }
      });
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    }
  };

  // Handle editing an existing task
  const handleEditTask = async (taskData: Omit<Task, 'id'>) => {
    if (!selectedTask || !storage.isReady) return;
    
    try {
      await storage.write(async () => {
        // Update the task
        await storage.update(TABLES.TASK, selectedTask.id, {
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate,
          priority: taskData.priority,
          completed: taskData.completed || false,
          checkInFrequency: taskData.checkInFrequency,
        } as Partial<Omit<TaskEntity, '_id' | 'createdAt'>>);
        
        // Delete existing subtasks
        const existingSubtasks = await storage.getSubtasks(selectedTask.id);
        for (const subtask of existingSubtasks) {
          await storage.delete(TABLES.SUBTASK, subtask._id);
        }
        
        // Create new subtasks if they exist
        if (taskData.subtasks && taskData.subtasks.length > 0) {
          for (const subtask of taskData.subtasks) {
            await storage.create(TABLES.SUBTASK, {
              _id: createObjectId(),
              taskId: selectedTask.id,
              title: subtask.title,
              completed: subtask.completed,
              priority: subtask.priority,
              timeEstimate: subtask.timeEstimate,
              orderIndex: subtask.orderIndex,
            } as Omit<SubTaskEntity, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string });
          }
        }
      });
      
      setSelectedTask(null);
    } catch (error) {
      console.error('Error editing task:', error);
      Alert.alert('Error', 'Failed to edit task. Please try again.');
    }
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
          onPress: async () => {
            if (!storage.isReady) return;
            
            try {
              await storage.write(async () => {
                // Delete subtasks first (foreign key constraint will handle this in SQLite)
                const subtasks = await storage.getSubtasks(taskId);
                for (const subtask of subtasks) {
                  await storage.delete(TABLES.SUBTASK, subtask._id);
                }
                
                // Delete the task
                await storage.delete(TABLES.TASK, taskId);
              });
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Handle toggling task completion
  const handleToggleComplete = async (taskId: string) => {
    if (!storage.isReady) return;
    
    try {
      // Find the task
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      await storage.write(async () => {
        // Toggle completion
        await storage.update(TABLES.TASK, taskId, {
          completed: !task.completed,
        } as Partial<Omit<TaskEntity, '_id' | 'createdAt'>>);
      });
    } catch (error) {
      console.error('Error toggling task completion:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
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
  const handleUpdateTaskWithSubtasks = async (updatedTask: Task) => {
    if (!storage.isReady) return;
    
    try {
      await storage.write(async () => {
        // Delete existing subtasks
        const existingSubtasks = await storage.getSubtasks(updatedTask.id);
        for (const subtask of existingSubtasks) {
          await storage.delete(TABLES.SUBTASK, subtask._id);
        }
        
        // Create new subtasks
        if (updatedTask.subtasks && updatedTask.subtasks.length > 0) {
          for (const subtask of updatedTask.subtasks) {
            await storage.create(TABLES.SUBTASK, {
              _id: createObjectId(),
              taskId: updatedTask.id,
              title: subtask.title,
              completed: subtask.completed,
              priority: subtask.priority,
              timeEstimate: subtask.timeEstimate,
              orderIndex: subtask.orderIndex,
            } as Omit<SubTaskEntity, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string });
          }
        }
        
        // Update the task's updatedAt timestamp
        await storage.update(TABLES.TASK, updatedTask.id, {
          updatedAt: getCurrentTimestamp(),
        } as Partial<Omit<TaskEntity, '_id' | 'createdAt'>>);
      });
    } catch (error) {
      console.error('Error updating task subtasks:', error);
      Alert.alert('Error', 'Failed to update task subtasks. Please try again.');
    }
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
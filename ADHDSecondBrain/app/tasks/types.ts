/**
 * Types for the tasks functionality
 */

// Define task priority type
export type TaskPriority = 'high' | 'medium' | 'low';

// Define check-in frequency type
export type CheckInFrequency = 'daily' | 'weekly' | 'none';

// Define subtask interface
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  priority?: TaskPriority; // Optional priority level for subtask
  timeEstimate?: number;   // Optional time estimate in minutes
  orderIndex: number;      // For drag and drop reordering (renamed from 'order' to avoid SQLite reserved keyword)
}

// Define task interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: TaskPriority;
  completed: boolean;
  checkInFrequency: CheckInFrequency;
  subtasks?: SubTask[];
}

// Priority colors
export const PriorityColors: Record<TaskPriority, string> = {
  high: '#FF3B30', // Red
  medium: '#FF9500', // Orange
  low: '#34C759', // Green
};

// Check-in frequency labels
export const CheckInFrequencyLabels: Record<CheckInFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  none: 'None',
};
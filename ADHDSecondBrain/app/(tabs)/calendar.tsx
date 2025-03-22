import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import WeeklyView from '../calendar/WeeklyView';
import MonthlyView from '../calendar/MonthlyView';
import DailyView from '../calendar/DailyView';
import AddEventModal from '../calendar/AddEventModal';
import GoogleCalendarSync from '../calendar/GoogleCalendarSync';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarEvent } from '../calendar/types';

type CalendarView = 'daily' | 'weekly' | 'monthly';

export default function CalendarScreen() {
  // Get the view parameter from the URL
  const params = useLocalSearchParams<{ view?: CalendarView }>();
  const [activeView, setActiveView] = useState<CalendarView>('weekly');
  
  // Set the active view based on the URL parameter when the component mounts
  useEffect(() => {
    if (params.view && ['daily', 'weekly', 'monthly'].includes(params.view)) {
      setActiveView(params.view as CalendarView);
    }
  }, [params.view]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showGoogleSyncModal, setShowGoogleSyncModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
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

  // Load mock events on initial render
  useEffect(() => {
    // In a real app, this would load from a database or API
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Meeting',
        description: 'Weekly team sync',
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(11, 0, 0, 0)),
        category: 'work',
        color: '#4285F4', // Google blue
        location: 'Conference Room A',
      },
      {
        id: '2',
        title: 'Lunch with Alex',
        start: new Date(new Date().setHours(12, 30, 0, 0)),
        end: new Date(new Date().setHours(13, 30, 0, 0)),
        category: 'personal',
        color: '#FBBC05', // Google yellow
      },
      {
        id: '3',
        title: 'Doctor Appointment',
        start: new Date(new Date().setDate(new Date().getDate() + 2)),
        end: new Date(new Date().setDate(new Date().getDate() + 2)),
        category: 'health',
        color: '#34A853', // Google green
        location: 'Medical Center',
      },
    ];
    
    setEvents(mockEvents);
  }, []);

  // Handle adding a new event
  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(), // Generate a unique ID
    };
    
    setEvents([...events, newEvent]);
  };

  // Handle editing an existing event
  const handleEditEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!editingEvent) return;
    
    const updatedEvents = events.map(event => 
      event.id === editingEvent.id 
        ? { ...eventData, id: event.id } 
        : event
    );
    
    setEvents(updatedEvents);
    setEditingEvent(undefined);
  };

  // Handle deleting an event
  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            const updatedEvents = events.filter(event => event.id !== eventId);
            setEvents(updatedEvents);
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Handle importing events from Google Calendar
  const handleImportEvents = (importedEvents: CalendarEvent[]) => {
    // In a real app, we would check for duplicates
    setEvents([...events, ...importedEvents]);
  };

  // Open add event modal with the selected date
  const handleAddEventPress = (date?: Date) => {
    setSelectedDate(date || new Date());
    setEditingEvent(undefined);
    setShowAddEventModal(true);
  };

  // Open edit event modal with the selected event
  const handleEventPress = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowAddEventModal(true);
  };

  // Render the appropriate view based on activeView
  const renderView = () => {
    // For now, we'll just render the view components without passing props
    // In a real implementation, we would update the view components to accept props
    switch (activeView) {
      case 'daily':
        return <DailyView />;
      case 'weekly':
        return <WeeklyView />;
      case 'monthly':
        return <MonthlyView />;
      default:
        return <WeeklyView />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Calendar</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: themeColors.buttonBackground }]}
            onPress={() => setShowGoogleSyncModal(true)}
          >
            <Ionicons name="sync" size={20} color={themeColors.buttonText} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: themeColors.buttonBackground }]}
            onPress={() => handleAddEventPress()}
          >
            <Ionicons name="add" size={24} color={themeColors.buttonText} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.viewSelector, { backgroundColor: themeColors.tabBackground }]}>
        <TouchableOpacity
          style={[
            styles.viewOption,
            activeView === 'daily' && { backgroundColor: themeColors.activeTab }
          ]}
          onPress={() => setActiveView('daily')}
        >
          <Text
            style={[
              styles.viewOptionText,
              { color: activeView === 'daily' ? '#FFFFFF' : themeColors.inactiveTab }
            ]}
          >
            Daily
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewOption,
            activeView === 'weekly' && { backgroundColor: themeColors.activeTab }
          ]}
          onPress={() => setActiveView('weekly')}
        >
          <Text
            style={[
              styles.viewOptionText,
              { color: activeView === 'weekly' ? '#FFFFFF' : themeColors.inactiveTab }
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewOption,
            activeView === 'monthly' && { backgroundColor: themeColors.activeTab }
          ]}
          onPress={() => setActiveView('monthly')}
        >
          <Text
            style={[
              styles.viewOptionText,
              { color: activeView === 'monthly' ? '#FFFFFF' : themeColors.inactiveTab }
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderView()}
      </ScrollView>

      {/* Add/Edit Event Modal */}
      <AddEventModal
        visible={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onSave={editingEvent ? handleEditEvent : handleAddEvent}
        initialDate={selectedDate}
        editEvent={editingEvent}
      />

      {/* Google Calendar Sync Modal */}
      <GoogleCalendarSync
        visible={showGoogleSyncModal}
        onClose={() => setShowGoogleSyncModal(false)}
        onImport={handleImportEvents}
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewOptionText: {
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
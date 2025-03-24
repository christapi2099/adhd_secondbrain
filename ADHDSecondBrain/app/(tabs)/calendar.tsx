import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Alert, Dimensions } from 'react-native';
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
import { useStorage, useQuery, createObjectId, getCurrentTimestamp } from '@/app/storage';
import { TABLES, CalendarEventEntity } from '@/app/storage/database';

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375; // Adjust for smaller Android screens

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

  // Get Storage instance
  const storage = useStorage();
  
  // Query events from SQLite database
  const { results: sqliteEvents, isLoading } = useQuery(TABLES.CALENDAR_EVENT);
  
  // Load events from SQLite database
  useEffect(() => {
    if (!user || !storage.isReady || isLoading) return;
    
    const loadEvents = async () => {
      try {
        // Get events for the current user
        const userEventsQuery = await storage.getByFilter(TABLES.CALENDAR_EVENT, 'userId', user.id);
        
        // Sort events by start date
        const sortedEvents = [...userEventsQuery].sort((a, b) => {
          const eventA = a as CalendarEventEntity;
          const eventB = b as CalendarEventEntity;
          return new Date(eventA.start).getTime() - new Date(eventB.start).getTime();
        });
        
        // Convert SQLite objects to plain JS objects
        const userEvents = sortedEvents.map((sqliteEvent) => {
          const event = sqliteEvent as CalendarEventEntity;
          const calendarEvent: CalendarEvent = {
            id: event._id,
            title: event.title,
            description: event.description,
            start: new Date(event.start),
            end: new Date(event.end),
            allDay: event.allDay,
            location: event.location,
            category: event.category,
            color: event.color,
            googleEventId: event.googleEventId
          };
          
          return calendarEvent;
        });
        
        setEvents(userEvents);
        
        // If no events exist yet, create some sample events
        if (userEvents.length === 0) {
          await storage.write(async () => {
            // Sample events
            await storage.create(TABLES.CALENDAR_EVENT, {
              _id: createObjectId(),
              userId: user.id,
              title: 'Team Meeting',
              description: 'Weekly team sync',
              start: new Date(new Date().setHours(10, 0, 0, 0)),
              end: new Date(new Date().setHours(11, 0, 0, 0)),
              category: 'work',
              color: '#4285F4', // Google blue
              location: 'Conference Room A',
            } as Omit<CalendarEventEntity, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string });
            
            await storage.create(TABLES.CALENDAR_EVENT, {
              _id: createObjectId(),
              userId: user.id,
              title: 'Lunch with Alex',
              start: new Date(new Date().setHours(12, 30, 0, 0)),
              end: new Date(new Date().setHours(13, 30, 0, 0)),
              category: 'personal',
              color: '#FBBC05', // Google yellow
            } as Omit<CalendarEventEntity, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string });
            
            await storage.create(TABLES.CALENDAR_EVENT, {
              _id: createObjectId(),
              userId: user.id,
              title: 'Doctor Appointment',
              start: new Date(new Date().setDate(new Date().getDate() + 2)),
              end: new Date(new Date().setDate(new Date().getDate() + 2)),
              category: 'health',
              color: '#34A853', // Google green
              location: 'Medical Center',
            } as Omit<CalendarEventEntity, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string });
          });
        }
      } catch (error) {
        console.error('Error loading events:', error);
        Alert.alert('Error', 'Failed to load events. Please try again.');
      }
    };
    
    loadEvents();
  }, [user, storage.isReady, isLoading, sqliteEvents]);

  // Handle adding a new event
  const handleAddEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!user || !storage.isReady) return;
    
    try {
      await storage.write(async () => {
        // Create the event in SQLite
        await storage.create(TABLES.CALENDAR_EVENT, {
          _id: createObjectId(),
          userId: user.id,
          title: eventData.title,
          description: eventData.description,
          start: eventData.start,
          end: eventData.end,
          allDay: eventData.allDay,
          location: eventData.location,
          category: eventData.category,
          color: eventData.color,
          googleEventId: eventData.googleEventId,
        } as Omit<CalendarEventEntity, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string });
      });
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', 'Failed to add event. Please try again.');
    }
  };

  // Handle editing an existing event
  const handleEditEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!editingEvent || !storage.isReady) return;
    
    try {
      await storage.write(async () => {
        // Update the event in SQLite
        await storage.update(TABLES.CALENDAR_EVENT, editingEvent.id, {
          title: eventData.title,
          description: eventData.description,
          start: eventData.start,
          end: eventData.end,
          allDay: eventData.allDay,
          location: eventData.location,
          category: eventData.category,
          color: eventData.color,
          googleEventId: eventData.googleEventId,
        } as Partial<Omit<CalendarEventEntity, '_id' | 'createdAt'>>);
      });
      
      setEditingEvent(undefined);
    } catch (error) {
      console.error('Error editing event:', error);
      Alert.alert('Error', 'Failed to edit event. Please try again.');
    }
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
          onPress: async () => {
            if (!storage.isReady) return;
            
            try {
              await storage.write(async () => {
                // Delete the event from SQLite
                await storage.delete(TABLES.CALENDAR_EVENT, eventId);
              });
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Handle importing events from Google Calendar
  const handleImportEvents = async (importedEvents: CalendarEvent[]) => {
    if (!user || !storage.isReady) return;
    
    try {
      await storage.write(async () => {
        // Import each event to SQLite
        for (const event of importedEvents) {
          // Check if event already exists by googleEventId
          if (event.googleEventId) {
            const existingEvents = await storage.query(
              `SELECT * FROM ${TABLES.CALENDAR_EVENT} WHERE googleEventId = ?`,
              [event.googleEventId]
            );
            
            if (existingEvents.length === 0) {
              // Create new event
              await storage.create(TABLES.CALENDAR_EVENT, {
                _id: createObjectId(),
                userId: user.id,
                title: event.title,
                description: event.description,
                start: event.start,
                end: event.end,
                allDay: event.allDay,
                location: event.location,
                category: event.category,
                color: event.color,
                googleEventId: event.googleEventId,
              } as Omit<CalendarEventEntity, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string });
            }
          }
        }
      });
    } catch (error) {
      console.error('Error importing events:', error);
      Alert.alert('Error', 'Failed to import events. Please try again.');
    }
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
    // Pass events and event handlers to the view components
    const viewProps = {
      events,
      onEventPress: handleEventPress,
      onAddEvent: handleAddEventPress,
      isSmallScreen,
    };
    
    switch (activeView) {
      case 'daily':
        return <DailyView {...viewProps} />;
      case 'weekly':
        return <WeeklyView {...viewProps} />;
      case 'monthly':
        return <MonthlyView {...viewProps} />;
      default:
        return <WeeklyView {...viewProps} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.header, 
        { 
          borderBottomColor: themeColors.border,
          paddingVertical: isSmallScreen ? 8 : 12,
        }
      ]}>
        <Text style={[
          styles.headerTitle, 
          { 
            color: themeColors.text,
            fontSize: isSmallScreen ? 18 : 20,
          }
        ]}>
          Calendar
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[
              styles.iconButton, 
              { 
                backgroundColor: themeColors.buttonBackground,
                width: isSmallScreen ? 32 : 36,
                height: isSmallScreen ? 32 : 36,
                borderRadius: isSmallScreen ? 16 : 18,
              }
            ]}
            onPress={() => setShowGoogleSyncModal(true)}
          >
            <Ionicons 
              name="sync" 
              size={isSmallScreen ? 18 : 20} 
              color={themeColors.buttonText} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.addButton, 
              { 
                backgroundColor: themeColors.buttonBackground,
                width: isSmallScreen ? 36 : 40,
                height: isSmallScreen ? 36 : 40,
                borderRadius: isSmallScreen ? 18 : 20,
              }
            ]}
            onPress={() => handleAddEventPress()}
          >
            <Ionicons 
              name="add" 
              size={isSmallScreen ? 22 : 24} 
              color={themeColors.buttonText} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[
        styles.viewSelector, 
        { 
          backgroundColor: themeColors.tabBackground,
          marginHorizontal: isSmallScreen ? 12 : 16,
          marginVertical: isSmallScreen ? 8 : 12,
        }
      ]}>
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
              { 
                color: activeView === 'daily' ? '#FFFFFF' : themeColors.inactiveTab,
                fontSize: isSmallScreen ? 13 : 14,
              }
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
              { 
                color: activeView === 'weekly' ? '#FFFFFF' : themeColors.inactiveTab,
                fontSize: isSmallScreen ? 13 : 14,
              }
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
              { 
                color: activeView === 'monthly' ? '#FFFFFF' : themeColors.inactiveTab,
                fontSize: isSmallScreen ? 13 : 14,
              }
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={[
        styles.content,
        { paddingHorizontal: isSmallScreen ? 12 : 16 }
      ]}>
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
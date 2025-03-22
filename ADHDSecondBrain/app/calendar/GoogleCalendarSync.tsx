import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { convertGoogleEvent } from './types';

interface GoogleCalendarSyncProps {
  visible: boolean;
  onClose: () => void;
  onImport: (events: any[]) => void;
}

interface GoogleCalendar {
  id: string;
  title: string;
  color: string;
  selected: boolean;
}

export default function GoogleCalendarSync({
  visible,
  onClose,
  onImport,
}: GoogleCalendarSyncProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    text: isDark ? Colors.dark.text : Colors.light.text,
    subText: isDark ? '#9BA1A6' : '#687076',
    card: isDark ? '#2C2C2E' : '#FFFFFF',
    border: isDark ? '#38383A' : '#E1E1E1',
    buttonPrimary: Colors.light.tint,
    buttonText: '#FFFFFF',
    buttonSecondary: isDark ? '#38383A' : '#E1E1E1',
    buttonSecondaryText: isDark ? Colors.dark.text : Colors.light.text,
    modalBackground: isDark ? '#1C1C1E' : '#FFFFFF',
  };

  // Mock Google authentication
  const handleConnect = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock calendars data
    const mockCalendars: GoogleCalendar[] = [
      {
        id: 'primary',
        title: 'My Calendar',
        color: '#4285F4', // Google blue
        selected: true,
      },
      {
        id: 'work',
        title: 'Work',
        color: '#EA4335', // Google red
        selected: false,
      },
      {
        id: 'family',
        title: 'Family',
        color: '#34A853', // Google green
        selected: false,
      },
      {
        id: 'birthdays',
        title: 'Birthdays',
        color: '#FBBC05', // Google yellow
        selected: false,
      },
    ];
    
    setCalendars(mockCalendars);
    setIsConnected(true);
    setIsLoading(false);
  };

  // Toggle calendar selection
  const toggleCalendarSelection = (id: string) => {
    setCalendars(
      calendars.map(cal =>
        cal.id === id ? { ...cal, selected: !cal.selected } : cal
      )
    );
  };

  // Import events from selected calendars
  const handleImport = async () => {
    const selectedCalendars = calendars.filter(cal => cal.selected);
    
    if (selectedCalendars.length === 0) {
      Alert.alert('No Calendars Selected', 'Please select at least one calendar to import events from.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock events data
    const mockEvents = [
      {
        id: 'event1',
        summary: 'Team Meeting',
        description: 'Weekly team sync',
        start: {
          dateTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        location: 'Conference Room A',
      },
      {
        id: 'event2',
        summary: 'Lunch with Client',
        description: 'Discuss project requirements',
        start: {
          dateTime: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: new Date(new Date().setHours(13, 30, 0, 0)).toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        location: 'Downtown Cafe',
      },
      {
        id: 'event3',
        summary: 'Doctor Appointment',
        start: {
          dateTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
          timeZone: 'America/Los_Angeles',
        },
      },
    ];
    
    // Convert Google events to app format
    const convertedEvents = mockEvents.map(event => convertGoogleEvent(event));
    
    setIsLoading(false);
    onImport(convertedEvents);
    onClose();
    
    // Show success message
    Alert.alert(
      'Import Successful',
      `Imported ${convertedEvents.length} events from Google Calendar.`
    );
  };

  // Disconnect from Google Calendar
  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Google Calendar',
      'Are you sure you want to disconnect your Google Calendar?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disconnect',
          onPress: () => {
            setIsConnected(false);
            setCalendars([]);
          },
          style: 'destructive',
        },
      ]
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
              Google Calendar Sync
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: themeColors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.buttonPrimary} />
                <Text style={[styles.loadingText, { color: themeColors.text }]}>
                  {isConnected ? 'Importing events...' : 'Connecting to Google Calendar...'}
                </Text>
              </View>
            ) : !isConnected ? (
              <View style={styles.connectContainer}>
                <Text style={[styles.description, { color: themeColors.text }]}>
                  Connect your Google Calendar to import events into your calendar.
                </Text>
                <TouchableOpacity
                  style={[styles.connectButton, { backgroundColor: '#4285F4' }]}
                  onPress={handleConnect}
                >
                  <Text style={styles.connectButtonText}>Connect Google Calendar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                  Select Calendars to Import
                </Text>
                <View style={styles.calendarList}>
                  {calendars.map(calendar => (
                    <View
                      key={calendar.id}
                      style={[
                        styles.calendarItem,
                        { 
                          backgroundColor: themeColors.card,
                          borderColor: themeColors.border,
                        },
                      ]}
                    >
                      <View style={styles.calendarInfo}>
                        <View
                          style={[styles.calendarColor, { backgroundColor: calendar.color }]}
                        />
                        <Text style={[styles.calendarTitle, { color: themeColors.text }]}>
                          {calendar.title}
                        </Text>
                      </View>
                      <Switch
                        value={calendar.selected}
                        onValueChange={() => toggleCalendarSelection(calendar.id)}
                        trackColor={{ false: themeColors.buttonSecondary, true: calendar.color }}
                        thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                      />
                    </View>
                  ))}
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.disconnectButton,
                      { backgroundColor: themeColors.buttonSecondary },
                    ]}
                    onPress={handleDisconnect}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: '#FF3B30' }, // Red for disconnect
                      ]}
                    >
                      Disconnect
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.importButton,
                      { backgroundColor: themeColors.buttonPrimary },
                    ]}
                    onPress={handleImport}
                  >
                    <Text style={[styles.buttonText, { color: themeColors.buttonText }]}>
                      Import Events
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
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
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  connectContainer: {
    padding: 16,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  calendarList: {
    marginBottom: 24,
  },
  calendarItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  calendarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  calendarTitle: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 8,
  },
  disconnectButton: {
    backgroundColor: '#E1E1E1',
  },
  importButton: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
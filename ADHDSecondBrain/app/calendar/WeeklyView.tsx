import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { CalendarEvent } from './types';
import EventItem from './EventItem';

export default function WeeklyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    text: isDark ? Colors.dark.text : Colors.light.text,
    subText: isDark ? '#9BA1A6' : '#687076',
    border: isDark ? '#38383A' : '#E1E1E1',
    today: isDark ? Colors.dark.tint : Colors.light.tint,
    dayBackground: isDark ? '#2C2C2E' : '#FFFFFF',
    headerBackground: isDark ? '#1C1C1E' : '#F2F2F7',
  };

  // Calculate the start and end of the current week
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

  // Mock events - in a real app, these would come from a database or API
  useEffect(() => {
    // Simulate loading events
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Meeting',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 0),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 11, 30),
        category: 'work',
        color: '#4285F4', // Google blue
      },
      {
        id: '2',
        title: 'Lunch with Alex',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 12, 30),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 13, 30),
        category: 'personal',
        color: '#FBBC05', // Google yellow
      },
      {
        id: '3',
        title: 'Doctor Appointment',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 15, 0),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 16, 0),
        category: 'health',
        color: '#34A853', // Google green
      },
    ];
    
    setEvents(mockEvents);
  }, [currentDate]);

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day));
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: themeColors.headerBackground }]}>
        <TouchableOpacity onPress={goToPreviousWeek}>
          <Text style={[styles.navButton, { color: themeColors.text }]}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: themeColors.text }]}>
          {format(startOfCurrentWeek, 'MMM d')} - {format(endOfCurrentWeek, 'MMM d, yyyy')}
        </Text>
        <TouchableOpacity onPress={goToNextWeek}>
          <Text style={[styles.navButton, { color: themeColors.text }]}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysContainer}>
        {daysOfWeek.map((day: Date, index: number) => {
          const isToday = isSameDay(day, new Date());
          return (
            <View key={index} style={styles.dayColumn}>
              <View 
                style={[
                  styles.dayHeader, 
                  { backgroundColor: themeColors.headerBackground },
                  isToday && { backgroundColor: themeColors.today }
                ]}
              >
                <Text style={[styles.dayName, { color: isToday ? '#FFFFFF' : themeColors.text }]}>
                  {format(day, 'EEE')}
                </Text>
                <Text style={[styles.dayNumber, { color: isToday ? '#FFFFFF' : themeColors.text }]}>
                  {format(day, 'd')}
                </Text>
              </View>
              <ScrollView style={[styles.eventsContainer, { backgroundColor: themeColors.dayBackground }]}>
                {getEventsForDay(day).map(event => (
                  <EventItem key={event.id} event={event} />
                ))}
              </ScrollView>
            </View>
          );
        })}
      </View>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  navButton: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 8,
  },
  daysContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 2,
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  eventsContainer: {
    flex: 1,
    marginTop: 4,
    borderRadius: 8,
    padding: 4,
  },
});
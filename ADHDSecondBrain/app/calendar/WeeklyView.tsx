import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { CalendarEvent } from './types';
import EventItem from './EventItem';
import { Ionicons } from '@expo/vector-icons';

// Define props interface
interface WeeklyViewProps {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  onAddEvent: (date?: Date) => void;
  isSmallScreen: boolean;
}

export default function WeeklyView({ events, onEventPress, onAddEvent, isSmallScreen }: WeeklyViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
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
    buttonBackground: isDark ? Colors.dark.tint : Colors.light.tint,
    buttonText: '#FFFFFF',
  };

  // Calculate the start and end of the current week
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

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

  // Calculate responsive sizes
  const dayColumnWidth = (Dimensions.get('window').width - (isSmallScreen ? 24 : 32)) / 7 - 4;
  const dayHeaderHeight = isSmallScreen ? 60 : 70;

  return (
    <View style={styles.container}>
      <View style={[
        styles.header, 
        { 
          backgroundColor: themeColors.headerBackground,
          paddingVertical: isSmallScreen ? 8 : 12,
          paddingHorizontal: isSmallScreen ? 12 : 16,
        }
      ]}>
        <TouchableOpacity 
          onPress={goToPreviousWeek}
          style={styles.navButton}
        >
          <Ionicons 
            name="chevron-back" 
            size={isSmallScreen ? 20 : 24} 
            color={themeColors.text} 
          />
        </TouchableOpacity>
        <Text style={[
          styles.headerText, 
          { 
            color: themeColors.text,
            fontSize: isSmallScreen ? 14 : 16,
          }
        ]}>
          {format(startOfCurrentWeek, 'MMM d')} - {format(endOfCurrentWeek, 'MMM d, yyyy')}
        </Text>
        <TouchableOpacity 
          onPress={goToNextWeek}
          style={styles.navButton}
        >
          <Ionicons 
            name="chevron-forward" 
            size={isSmallScreen ? 20 : 24} 
            color={themeColors.text} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.daysContainer}>
        {daysOfWeek.map((day: Date, index: number) => {
          const isToday = isSameDay(day, new Date());
          const dayEvents = getEventsForDay(day);
          
          return (
            <View 
              key={index} 
              style={[
                styles.dayColumn,
                { width: dayColumnWidth }
              ]}
            >
              <View 
                style={[
                  styles.dayHeader, 
                  { 
                    backgroundColor: themeColors.headerBackground,
                    height: dayHeaderHeight,
                  },
                  isToday && { backgroundColor: themeColors.today }
                ]}
              >
                <Text style={[
                  styles.dayName, 
                  { 
                    color: isToday ? '#FFFFFF' : themeColors.text,
                    fontSize: isSmallScreen ? 11 : 12,
                  }
                ]}>
                  {format(day, 'EEE')}
                </Text>
                <Text style={[
                  styles.dayNumber, 
                  { 
                    color: isToday ? '#FFFFFF' : themeColors.text,
                    fontSize: isSmallScreen ? 14 : 16,
                  }
                ]}>
                  {format(day, 'd')}
                </Text>
                
                {/* Add event button */}
                <TouchableOpacity
                  style={[
                    styles.addEventButton,
                    { backgroundColor: isToday ? '#FFFFFF' : themeColors.buttonBackground }
                  ]}
                  onPress={() => onAddEvent(day)}
                >
                  <Ionicons 
                    name="add" 
                    size={isSmallScreen ? 12 : 14} 
                    color={isToday ? themeColors.today : themeColors.buttonText} 
                  />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={[
                  styles.eventsContainer, 
                  { backgroundColor: themeColors.dayBackground }
                ]}
              >
                {dayEvents.length > 0 ? (
                  dayEvents.map(event => (
                    <EventItem 
                      key={event.id} 
                      event={event} 
                      onPress={() => onEventPress(event)}
                      compact={isSmallScreen}
                    />
                  ))
                ) : (
                  <View style={styles.emptyDay}>
                    <Text 
                      style={[
                        styles.emptyDayText, 
                        { 
                          color: themeColors.subText,
                          fontSize: isSmallScreen ? 10 : 11,
                        }
                      ]}
                    >
                      No events
                    </Text>
                  </View>
                )}
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
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    fontWeight: '600',
  },
  navButton: {
    padding: 4,
  },
  daysContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 2,
  },
  dayHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  dayName: {
    fontWeight: '500',
  },
  dayNumber: {
    fontWeight: 'bold',
    marginTop: 2,
  },
  addEventButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  eventsContainer: {
    flex: 1,
    marginTop: 4,
    borderRadius: 8,
    padding: 4,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyDayText: {
    fontStyle: 'italic',
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { CalendarEvent } from './types';
import EventItem from './EventItem';
import { Ionicons } from '@expo/vector-icons';

// Define props interface
interface MonthlyViewProps {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  onAddEvent: (date?: Date) => void;
  isSmallScreen: boolean;
}

export default function MonthlyView({ events, onEventPress, onAddEvent, isSmallScreen }: MonthlyViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    text: isDark ? Colors.dark.text : Colors.light.text,
    subText: isDark ? '#9BA1A6' : '#687076',
    border: isDark ? '#38383A' : '#E1E1E1',
    today: isDark ? Colors.dark.tint : Colors.light.tint,
    selected: isDark ? '#4285F4' : '#4285F4',
    dayBackground: isDark ? '#2C2C2E' : '#FFFFFF',
    headerBackground: isDark ? '#1C1C1E' : '#F2F2F7',
    otherMonthDay: isDark ? '#38383A' : '#E1E1E1',
    buttonBackground: isDark ? Colors.dark.tint : Colors.light.tint,
    buttonText: '#FFFFFF',
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day));
  };

  // Generate calendar days including days from previous and next months to fill the grid
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const calendarDays = generateCalendarDays();

  // Day names for the header
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate responsive sizes
  const fontSize = {
    header: isSmallScreen ? 14 : 16,
    dayName: isSmallScreen ? 10 : 12,
    dayNumber: isSmallScreen ? 12 : 14,
    eventIndicator: isSmallScreen ? 5 : 6,
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.header, 
        { 
          backgroundColor: themeColors.headerBackground,
          paddingVertical: isSmallScreen ? 8 : 12,
        }
      ]}>
        <TouchableOpacity 
          onPress={goToPreviousMonth}
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
            fontSize: fontSize.header,
          }
        ]}>
          {format(currentDate, 'MMMM yyyy')}
        </Text>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[
              styles.addButton, 
              { backgroundColor: themeColors.buttonBackground }
            ]}
            onPress={() => onAddEvent(selectedDate)}
          >
            <Ionicons 
              name="add" 
              size={isSmallScreen ? 20 : 22} 
              color={themeColors.buttonText} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={goToNextMonth}
            style={styles.navButton}
          >
            <Ionicons 
              name="chevron-forward" 
              size={isSmallScreen ? 20 : 24} 
              color={themeColors.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        {/* Day names header */}
        <View style={styles.dayNamesRow}>
          {dayNames.map((name, index) => (
            <View key={index} style={styles.dayNameCell}>
              <Text style={[
                styles.dayNameText, 
                { 
                  color: themeColors.subText,
                  fontSize: fontSize.dayName,
                }
              ]}>
                {name}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day: Date, index: number) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  { 
                    backgroundColor: isSelected 
                      ? themeColors.selected 
                      : themeColors.dayBackground 
                  }
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    { 
                      color: isSelected 
                        ? '#FFFFFF' 
                        : isToday 
                          ? themeColors.today 
                          : isCurrentMonth 
                            ? themeColors.text 
                            : themeColors.otherMonthDay,
                      fontSize: fontSize.dayNumber,
                    },
                    isToday && !isSelected && styles.todayText
                  ]}
                >
                  {format(day, 'd')}
                </Text>
                
                {hasEvents && (
                  <View style={styles.eventIndicatorsContainer}>
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <View 
                        key={eventIndex} 
                        style={[
                          styles.eventIndicator, 
                          { 
                            backgroundColor: event.color,
                            width: fontSize.eventIndicator,
                            height: fontSize.eventIndicator,
                            borderRadius: fontSize.eventIndicator / 2,
                          }
                        ]}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <Text style={[styles.moreEventsText, { color: themeColors.subText }]}>
                        +{dayEvents.length - 3}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected day events */}
      <View style={styles.selectedDayContainer}>
        <View style={styles.selectedDayHeaderContainer}>
          <Text style={[
            styles.selectedDayHeader, 
            { 
              color: themeColors.text,
              fontSize: isSmallScreen ? 14 : 16,
            }
          ]}>
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </Text>
          <TouchableOpacity
            style={[
              styles.addDayEventButton,
              { backgroundColor: themeColors.buttonBackground }
            ]}
            onPress={() => onAddEvent(selectedDate)}
          >
            <Ionicons 
              name="add" 
              size={isSmallScreen ? 16 : 18} 
              color={themeColors.buttonText} 
            />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.eventsContainer}>
          {getEventsForDay(selectedDate).length > 0 ? (
            getEventsForDay(selectedDate).map(event => (
              <EventItem 
                key={event.id} 
                event={event} 
                onPress={() => onEventPress(event)}
                compact={isSmallScreen}
              />
            ))
          ) : (
            <Text style={[styles.noEventsText, { color: themeColors.subText }]}>
              No events scheduled for this day
            </Text>
          )}
        </ScrollView>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 4,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  calendarContainer: {
    marginBottom: 16,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 7 days per row
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  todayText: {
    fontWeight: 'bold',
  },
  eventIndicatorsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  moreEventsText: {
    fontSize: 10,
    marginLeft: 2,
  },
  selectedDayContainer: {
    flex: 1,
    marginTop: 8,
  },
  selectedDayHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedDayHeader: {
    fontSize: 16,
    fontWeight: '600',
  },
  addDayEventButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsContainer: {
    flex: 1,
  },
  noEventsText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
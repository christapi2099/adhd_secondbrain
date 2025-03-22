import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
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
  getDay,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { CalendarEvent } from './types';
import EventItem from './EventItem';

export default function MonthlyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
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
    selected: isDark ? '#4285F4' : '#4285F4',
    dayBackground: isDark ? '#2C2C2E' : '#FFFFFF',
    headerBackground: isDark ? '#1C1C1E' : '#F2F2F7',
    otherMonthDay: isDark ? '#38383A' : '#E1E1E1',
  };

  // Mock events - in a real app, these would come from a database or API
  useEffect(() => {
    // Simulate loading events
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Meeting',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10, 10, 0),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10, 11, 30),
        category: 'work',
        color: '#4285F4', // Google blue
      },
      {
        id: '2',
        title: 'Lunch with Alex',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 12, 30),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 13, 30),
        category: 'personal',
        color: '#FBBC05', // Google yellow
      },
      {
        id: '3',
        title: 'Doctor Appointment',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 15, 0),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 16, 0),
        category: 'health',
        color: '#34A853', // Google green
      },
    ];
    
    setEvents(mockEvents);
  }, [currentDate]);

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

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: themeColors.headerBackground }]}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={[styles.navButton, { color: themeColors.text }]}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: themeColors.text }]}>
          {format(currentDate, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={[styles.navButton, { color: themeColors.text }]}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarContainer}>
        {/* Day names header */}
        <View style={styles.dayNamesRow}>
          {dayNames.map((name, index) => (
            <View key={index} style={styles.dayNameCell}>
              <Text style={[styles.dayNameText, { color: themeColors.subText }]}>
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
                            : themeColors.otherMonthDay 
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
                        style={[styles.eventIndicator, { backgroundColor: event.color }]} 
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
        <Text style={[styles.selectedDayHeader, { color: themeColors.text }]}>
          Events for {format(selectedDate, 'MMMM d, yyyy')}
        </Text>
        <ScrollView style={styles.eventsContainer}>
          {getEventsForDay(selectedDate).length > 0 ? (
            getEventsForDay(selectedDate).map(event => (
              <EventItem key={event.id} event={event} />
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
  navButton: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 8,
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
  selectedDayHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
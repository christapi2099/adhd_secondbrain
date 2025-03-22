import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { CalendarEvent } from './types';
import EventItem from './EventItem';

export default function DailyView() {
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
    timelineBackground: isDark ? '#1C1C1E' : '#F2F2F7',
    timeText: isDark ? '#9BA1A6' : '#687076',
    currentTimeIndicator: '#FF3B30', // Red for current time indicator
    hourDivider: isDark ? '#38383A' : '#E1E1E1',
  };

  // Mock events - in a real app, these would come from a database or API
  useEffect(() => {
    // Simulate loading events
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Morning Standup',
        description: 'Daily team standup meeting to discuss progress and blockers',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9, 0),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9, 30),
        category: 'work',
        color: '#4285F4', // Google blue
        location: 'Conference Room A',
      },
      {
        id: '2',
        title: 'Lunch Break',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 12, 0),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 13, 0),
        category: 'personal',
        color: '#FBBC05', // Google yellow
      },
      {
        id: '3',
        title: 'Project Review',
        description: 'Review project progress with stakeholders',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 14, 0),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 15, 30),
        category: 'work',
        color: '#4285F4', // Google blue
        location: 'Main Meeting Room',
      },
      {
        id: '4',
        title: 'Gym Session',
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 18, 0),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 19, 0),
        category: 'health',
        color: '#34A853', // Google green
        location: 'Fitness Center',
      },
    ];
    
    setEvents(mockEvents);
  }, [currentDate]);

  // Navigate to previous day
  const goToPreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  // Navigate to next day
  const goToNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  // Get events for the current day
  const getEventsForDay = () => {
    return events.filter(event => isSameDay(event.start, currentDate));
  };

  // Check if the current day is today
  const isToday = isSameDay(currentDate, new Date());

  // Generate time slots for the day (hourly)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Get events that overlap with a specific hour
  const getEventsForHour = (hour: number) => {
    return getEventsForDay().filter(event => {
      const eventStartHour = event.start.getHours();
      const eventEndHour = event.end.getHours();
      return (eventStartHour <= hour && eventEndHour > hour) || eventStartHour === hour;
    });
  };

  // Get the current hour
  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: themeColors.background }]}>
        <TouchableOpacity onPress={goToPreviousDay}>
          <Text style={[styles.navButton, { color: themeColors.text }]}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerText, { color: themeColors.text }]}>
            {format(currentDate, 'EEEE')}
          </Text>
          <Text style={[styles.headerDate, { color: themeColors.text }]}>
            {format(currentDate, 'MMMM d, yyyy')} {isToday && <Text style={styles.todayIndicator}> • Today</Text>}
          </Text>
        </View>
        <TouchableOpacity onPress={goToNextDay}>
          <Text style={[styles.navButton, { color: themeColors.text }]}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.timelineContainer}>
        {timeSlots.map(hour => {
          const hourEvents = getEventsForHour(hour);
          const isCurrentHour = isToday && hour === currentHour;
          
          return (
            <View key={hour} style={styles.timeSlot}>
              <View style={styles.timeColumn}>
                <Text style={[styles.timeText, { color: themeColors.timeText }]}>
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </Text>
              </View>
              
              <View style={[styles.eventColumn, { borderTopColor: themeColors.hourDivider }]}>
                {isCurrentHour && (
                  <View 
                    style={[
                      styles.currentTimeIndicator, 
                      { 
                        backgroundColor: themeColors.currentTimeIndicator,
                        top: `${(currentMinutes / 60) * 100}%`
                      }
                    ]} 
                  />
                )}
                
                {hourEvents.map(event => {
                  // Calculate position and height based on event start and end times
                  const eventStartMinutes = event.start.getHours() === hour ? event.start.getMinutes() : 0;
                  const eventEndHour = event.end.getHours();
                  const eventEndMinutes = event.end.getMinutes();
                  
                  // If event ends in a future hour, extend to the end of this hour
                  const durationInMinutes = eventEndHour > hour 
                    ? 60 - eventStartMinutes 
                    : eventEndMinutes - eventStartMinutes;
                  
                  // Convert percentages to numeric values (0-1 scale)
                  const topPercentage = (eventStartMinutes / 60);
                  const heightPercentage = (durationInMinutes / 60);
                  
                  return (
                    <View 
                      key={event.id} 
                      style={[
                        styles.eventItem,
                        {
                          top: `${topPercentage * 100}%`,
                          height: `${heightPercentage * 100}%`,
                          borderLeftColor: event.color,
                        }
                      ]}
                    >
                      <EventItem event={event} />
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
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
    marginBottom: 8,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerDate: {
    fontSize: 14,
    marginTop: 4,
  },
  todayIndicator: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  navButton: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 8,
  },
  timelineContainer: {
    flex: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    height: 60, // 1 hour = 60 pixels
  },
  timeColumn: {
    width: 60,
    paddingRight: 8,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  timeText: {
    fontSize: 12,
  },
  eventColumn: {
    flex: 1,
    borderTopWidth: 1,
    position: 'relative',
  },
  currentTimeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 10,
  },
  eventItem: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderLeftWidth: 3,
    paddingLeft: 4,
  },
});
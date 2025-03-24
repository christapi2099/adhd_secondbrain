import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { CalendarEvent } from './types';
import EventItem from './EventItem';
import { Ionicons } from '@expo/vector-icons';

// Define props interface
interface DailyViewProps {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  onAddEvent: (date?: Date) => void;
  isSmallScreen: boolean;
}

export default function DailyView({ events, onEventPress, onAddEvent, isSmallScreen }: DailyViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
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
    buttonBackground: isDark ? Colors.dark.tint : Colors.light.tint,
    buttonText: '#FFFFFF',
  };

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

  // Calculate responsive sizes
  const timeColumnWidth = isSmallScreen ? 50 : 60;
  const timeSlotHeight = isSmallScreen ? 50 : 60;
  const fontSize = {
    header: isSmallScreen ? 16 : 18,
    subheader: isSmallScreen ? 12 : 14,
    time: isSmallScreen ? 10 : 12,
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.header, 
        { 
          backgroundColor: themeColors.background,
          paddingVertical: isSmallScreen ? 8 : 12,
        }
      ]}>
        <TouchableOpacity 
          onPress={goToPreviousDay}
          style={styles.navButton}
        >
          <Ionicons 
            name="chevron-back" 
            size={isSmallScreen ? 20 : 24} 
            color={themeColors.text} 
          />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={[
            styles.headerText, 
            { 
              color: themeColors.text,
              fontSize: fontSize.header,
            }
          ]}>
            {format(currentDate, 'EEEE')}
          </Text>
          <Text style={[
            styles.headerDate, 
            { 
              color: themeColors.text,
              fontSize: fontSize.subheader,
            }
          ]}>
            {format(currentDate, 'MMMM d, yyyy')} {isToday && <Text style={styles.todayIndicator}> • Today</Text>}
          </Text>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[
              styles.addButton, 
              { backgroundColor: themeColors.buttonBackground }
            ]}
            onPress={() => onAddEvent(currentDate)}
          >
            <Ionicons 
              name="add" 
              size={isSmallScreen ? 20 : 22} 
              color={themeColors.buttonText} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={goToNextDay}
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

      <ScrollView style={styles.timelineContainer}>
        {timeSlots.map(hour => {
          const hourEvents = getEventsForHour(hour);
          const isCurrentHour = isToday && hour === currentHour;
          
          return (
            <View 
              key={hour} 
              style={[
                styles.timeSlot,
                { height: timeSlotHeight }
              ]}
            >
              <View style={[
                styles.timeColumn,
                { width: timeColumnWidth }
              ]}>
                <Text style={[
                  styles.timeText, 
                  { 
                    color: themeColors.timeText,
                    fontSize: fontSize.time,
                  }
                ]}>
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
                      <EventItem 
                        event={event} 
                        onPress={() => onEventPress(event)}
                        compact={isSmallScreen}
                      />
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
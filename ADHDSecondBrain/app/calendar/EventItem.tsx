import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { format } from 'date-fns';
import { CalendarEvent } from './types';
import { Colors } from '@/constants/Colors';

interface EventItemProps {
  event: CalendarEvent;
  onPress?: (event: CalendarEvent) => void;
  compact?: boolean;
}

export default function EventItem({ event, onPress, compact = false }: EventItemProps) {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    text: isDark ? Colors.dark.text : Colors.light.text,
    subText: isDark ? '#9BA1A6' : '#687076',
    cardBackground: isDark ? '#2C2C2E' : '#FFFFFF',
    border: isDark ? '#38383A' : '#E1E1E1',
  };

  // Format the event time
  const formatEventTime = () => {
    if (event.allDay) {
      return 'All day';
    }
    
    const startTime = format(event.start, 'h:mm a');
    const endTime = format(event.end, 'h:mm a');
    return `${startTime} - ${endTime}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: themeColors.cardBackground,
          borderLeftColor: event.color,
          height: compact ? 40 : 'auto',
        }
      ]}
      onPress={() => onPress && onPress(event)}
    >
      <View style={styles.content}>
        <Text 
          style={[styles.title, { color: themeColors.text }]}
          numberOfLines={compact ? 1 : 2}
        >
          {event.title}
        </Text>
        
        {!compact && event.location && (
          <Text style={[styles.location, { color: themeColors.subText }]} numberOfLines={1}>
            📍 {event.location}
          </Text>
        )}
        
        <Text style={[styles.time, { color: themeColors.subText }]}>
          {formatEventTime()}
        </Text>
      </View>
      
      {!compact && (
        <View style={[styles.categoryTag, { backgroundColor: event.color + '33' }]}>
          <Text style={[styles.categoryText, { color: event.color }]}>
            {event.category}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
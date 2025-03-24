import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    text: isDark ? Colors.dark.text : Colors.light.text,
    secondaryText: isDark ? '#9BA1A6' : '#666',
    card: isDark ? '#2C2C2E' : '#FFFFFF',
    border: isDark ? '#38383A' : '#E1E1E1',
    buttonBackground: isDark ? Colors.dark.tint : Colors.light.tint,
    buttonText: '#FFFFFF',
  };

  // Get current date and time
  const now = new Date();
  const hours = now.getHours();
  
  // Determine greeting based on time of day
  let greeting = 'Good morning';
  if (hours >= 12 && hours < 17) {
    greeting = 'Good afternoon';
  } else if (hours >= 17) {
    greeting = 'Good evening';
  }

  // Navigation functions
  const goToCalendar = () => {
    router.push('/calendar');
  };
  
  const goToTasks = () => {
    router.push('/tasks');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: themeColors.text }]}>
            {greeting},
          </Text>
          <Text style={[styles.userName, { color: themeColors.text }]}>
            {user?.name || 'User'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Today's Schedule
          </Text>
          
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={goToCalendar}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={24} color={themeColors.buttonBackground} />
              <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                Your Calendar
              </Text>
            </View>
            
            <Text style={[styles.cardDescription, { color: themeColors.secondaryText }]}>
              View and manage your schedule, events, and appointments
            </Text>
            
            <View style={styles.cardFooter}>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: themeColors.buttonBackground }]}
                onPress={goToCalendar}
              >
                <Text style={[styles.buttonText, { color: themeColors.buttonText }]}>
                  View Calendar
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border, marginTop: 16 }]}
            onPress={goToTasks}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="checkbox-outline" size={24} color={themeColors.buttonBackground} />
              <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                Your Tasks
              </Text>
            </View>
            
            <Text style={[styles.cardDescription, { color: themeColors.secondaryText }]}>
              Manage your tasks, set deadlines, and break down big assignments
            </Text>
            
            <View style={styles.cardFooter}>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: themeColors.buttonBackground }]}
                onPress={goToTasks}
              >
                <Text style={[styles.buttonText, { color: themeColors.buttonText }]}>
                  View Tasks
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={goToCalendar}
            >
              <Ionicons name="add-circle" size={24} color="#4285F4" />
              <Text style={[styles.quickActionText, { color: themeColors.text }]}>
                New Event
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={goToTasks}
            >
              <Ionicons name="add-circle-outline" size={24} color="#34A853" />
              <Text style={[styles.quickActionText, { color: themeColors.text }]}>
                New Task
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={goToCalendar}
            >
              <Ionicons name="today" size={24} color="#FBBC05" />
              <Text style={[styles.quickActionText, { color: themeColors.text }]}>
                Today
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={() => router.push('/profile')}
            >
              <Ionicons name="settings-outline" size={24} color="#EA4335" />
              <Text style={[styles.quickActionText, { color: themeColors.text }]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            ADHD Tips
          </Text>
          
          <View style={[styles.tipCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.tipTitle, { color: themeColors.text }]}>
              Time Blocking
            </Text>
            <Text style={[styles.tipDescription, { color: themeColors.secondaryText }]}>
              Allocate specific time blocks for different tasks to maintain focus and reduce context switching.
            </Text>
          </View>
          
          <View style={[styles.tipCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.tipTitle, { color: themeColors.text }]}>
              2-Minute Rule
            </Text>
            <Text style={[styles.tipDescription, { color: themeColors.secondaryText }]}>
              If a task takes less than 2 minutes to complete, do it immediately instead of scheduling it for later.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickAction: {
    width: '46%',
    margin: '2%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickActionText: {
    marginTop: 8,
    fontWeight: '500',
  },
  tipCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
  },
});
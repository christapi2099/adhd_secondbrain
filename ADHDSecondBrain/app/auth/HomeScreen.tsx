// screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    text: isDark ? Colors.dark.text : Colors.light.text,
    secondaryText: isDark ? '#9BA1A6' : '#666',
    infoContainer: isDark ? '#2C2C2E' : '#f9f9f9',
    infoText: isDark ? Colors.dark.text : '#333',
    logoutButton: '#ff3b30', // Keep the logout button red in both themes
    logoutButtonText: '#fff',
  };
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.welcome, { color: themeColors.text }]}>Welcome!</Text>
      <Text style={[styles.userInfo, { color: themeColors.text }]}>
        {user?.name ? `${user.name}` : 'User'}
      </Text>
      <Text style={[styles.email, { color: themeColors.secondaryText }]}>
        {user?.email}
      </Text>
      
      <View style={[styles.infoContainer, { backgroundColor: themeColors.infoContainer }]}>
        <Text style={[styles.infoText, { color: themeColors.infoText }]}>
          You are now logged in via {user?.provider || 'email'}.
        </Text>
        <Text style={[styles.infoText, { color: themeColors.infoText }]}>
          This is your home screen. You can add your app content here.
        </Text>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 18,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  infoContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 40,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
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
    dangerButton: '#FF3B30',
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
        </View>
        <Text style={[styles.userName, { color: themeColors.text }]}>
          {user?.name || 'User'}
        </Text>
        <Text style={[styles.userEmail, { color: themeColors.secondaryText }]}>
          {user?.email || 'user@example.com'}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Calendar Settings
        </Text>

        <View style={[styles.settingCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color={themeColors.text} />
            <Text style={[styles.settingText, { color: themeColors.text }]}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="time-outline" size={24} color={themeColors.text} />
            <Text style={[styles.settingText, { color: themeColors.text }]}>Time Zone</Text>
            <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="color-palette-outline" size={24} color={themeColors.text} />
            <Text style={[styles.settingText, { color: themeColors.text }]}>Event Categories</Text>
            <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 24 }]}>
          Account
        </Text>

        <View style={[styles.settingCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="person-outline" size={24} color={themeColors.text} />
            <Text style={[styles.settingText, { color: themeColors.text }]}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="lock-closed-outline" size={24} color={themeColors.text} />
            <Text style={[styles.settingText, { color: themeColors.text }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: themeColors.dangerButton }]}
          onPress={logout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  settingsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  logoutButton: {
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
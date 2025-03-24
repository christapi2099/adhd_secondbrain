import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Image, Switch, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useStorage, useQuery, createObjectId, getCurrentTimestamp } from '@/app/storage';
import { TABLES, UserEntity } from '@/app/storage/database';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Storage hooks
  const storage = useStorage();
  const { results: userPreferences, isLoading } = useQuery(TABLES.USER);

  // User preferences state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [timeZone, setTimeZone] = useState('UTC');
  const [showTimeZoneModal, setShowTimeZoneModal] = useState(false);
  const [tempTimeZone, setTempTimeZone] = useState('');
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);

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

  // Load user preferences from SQLite
  useEffect(() => {
    if (!user || !storage.isReady || isLoading) return;

    const loadUserPreferences = async () => {
      try {
        // Find user preferences in SQLite
        const userPrefs = await storage.getByFilter(TABLES.USER, 'userId', user.id);
        const userPref = userPrefs.length > 0 ? userPrefs[0] as UserEntity : null;
        
        if (userPref) {
          // Set state from SQLite data
          setNotificationsEnabled(userPref.notificationsEnabled ?? true);
          setTimeZone(userPref.timeZone ?? 'UTC');
        } else {
          // Create default user preferences in SQLite
          await storage.write(async () => {
            await storage.create(TABLES.USER, {
              _id: createObjectId(),
              userId: user.id,
              email: user.email,
              name: user.name,
              provider: user.provider,
              notificationsEnabled: true,
              timeZone: 'UTC',
            } as Omit<UserEntity, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string });
          });
          
          // Set default values
          setNotificationsEnabled(true);
          setTimeZone('UTC');
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, [user, storage.isReady, isLoading, userPreferences]);

  // Toggle notifications
  const toggleNotifications = async () => {
    if (!user || !storage.isReady) return;

    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    
    try {
      await storage.write(async () => {
        // Find user preferences in SQLite
        const userPrefs = await storage.getByFilter(TABLES.USER, 'userId', user.id);
        const userPref = userPrefs.length > 0 ? userPrefs[0] as UserEntity : null;
        
        if (userPref) {
          // Update notifications setting
          await storage.update(TABLES.USER, userPref._id, {
            notificationsEnabled: newValue,
            updatedAt: getCurrentTimestamp(),
          } as Partial<Omit<UserEntity, '_id' | 'createdAt'>>);
        }
      });
    } catch (error) {
      console.error('Error updating notifications setting:', error);
      // Revert state if update fails
      setNotificationsEnabled(!newValue);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  // Save time zone
  const saveTimeZone = async () => {
    if (!user || !tempTimeZone || !storage.isReady) return;

    try {
      await storage.write(async () => {
        // Find user preferences in SQLite
        const userPrefs = await storage.getByFilter(TABLES.USER, 'userId', user.id);
        const userPref = userPrefs.length > 0 ? userPrefs[0] as UserEntity : null;
        
        if (userPref) {
          // Update time zone
          await storage.update(TABLES.USER, userPref._id, {
            timeZone: tempTimeZone,
            updatedAt: getCurrentTimestamp(),
          } as Partial<Omit<UserEntity, '_id' | 'createdAt'>>);
        }
      });
      
      setTimeZone(tempTimeZone);
      setShowTimeZoneModal(false);
    } catch (error) {
      console.error('Error updating time zone:', error);
      Alert.alert('Error', 'Failed to update time zone');
    }
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
          <View style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color={themeColors.text} />
            <Text style={[styles.settingText, { color: themeColors.text }]}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#767577', true: Colors.light.tint }}
              thumbColor={notificationsEnabled ? Colors.dark.tint : '#f4f3f4'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              setTempTimeZone(timeZone);
              setShowTimeZoneModal(true);
            }}
          >
            <Ionicons name="time-outline" size={24} color={themeColors.text} />
            <Text style={[styles.settingText, { color: themeColors.text }]}>Time Zone</Text>
            <View style={styles.settingValue}>
              <Text style={{ color: themeColors.secondaryText }}>{timeZone}</Text>
              <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowCategoriesModal(true)}
          >
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

      {/* Time Zone Modal */}
      <Modal
        visible={showTimeZoneModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Set Time Zone</Text>
            
            <TextInput
              style={[styles.input, { 
                color: themeColors.text, 
                backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
                borderColor: themeColors.border
              }]}
              value={tempTimeZone}
              onChangeText={setTempTimeZone}
              placeholder="Enter time zone (e.g., UTC, America/New_York)"
              placeholderTextColor={themeColors.secondaryText}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { borderColor: themeColors.border }]}
                onPress={() => setShowTimeZoneModal(false)}
              >
                <Text style={{ color: themeColors.text }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: themeColors.buttonBackground }]}
                onPress={saveTimeZone}
              >
                <Text style={{ color: themeColors.buttonText }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Categories Modal */}
      <Modal
        visible={showCategoriesModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Event Categories</Text>
            
            <View style={styles.categoriesList}>
              <View style={styles.categoryItem}>
                <View style={[styles.colorDot, { backgroundColor: '#4285F4' }]} />
                <Text style={[styles.categoryText, { color: themeColors.text }]}>Work</Text>
              </View>
              
              <View style={styles.categoryItem}>
                <View style={[styles.colorDot, { backgroundColor: '#FBBC05' }]} />
                <Text style={[styles.categoryText, { color: themeColors.text }]}>Personal</Text>
              </View>
              
              <View style={styles.categoryItem}>
                <View style={[styles.colorDot, { backgroundColor: '#34A853' }]} />
                <Text style={[styles.categoryText, { color: themeColors.text }]}>Health</Text>
              </View>
              
              <View style={styles.categoryItem}>
                <View style={[styles.colorDot, { backgroundColor: '#EA4335' }]} />
                <Text style={[styles.categoryText, { color: themeColors.text }]}>Education</Text>
              </View>
              
              <View style={styles.categoryItem}>
                <View style={[styles.colorDot, { backgroundColor: '#9C27B0' }]} />
                <Text style={[styles.categoryText, { color: themeColors.text }]}>Social</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: themeColors.buttonBackground, alignSelf: 'center' }]}
              onPress={() => setShowCategoriesModal(false)}
            >
              <Text style={{ color: themeColors.buttonText }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  categoriesList: {
    width: '100%',
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
  },
});
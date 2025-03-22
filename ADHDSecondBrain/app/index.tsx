import { Text, View, TouchableOpacity, StyleSheet, Alert, useColorScheme, ScrollView } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  const { logout, user } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    text: isDark ? Colors.dark.text : Colors.light.text,
    card: isDark ? '#2C2C2E' : '#f0f0f0',
    cardText: isDark ? '#E1E1E1' : '#333333',
    subtitle: isDark ? '#9BA1A6' : '#666666',
    helpText: isDark ? '#9BA1A6' : '#666666',
    calendarCard: isDark ? '#1C1C1E' : '#ffffff',
    calendarCardBorder: isDark ? '#38383A' : '#e0e0e0',
    calendarCardText: isDark ? '#E1E1E1' : '#333333',
    calendarCardIcon: isDark ? Colors.dark.tint : Colors.light.tint,
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out user:", user);
      await logout();
      console.log("Logout successful, user should be null now");
      
      // Force navigation to login screen
      router.replace("/auth/LoginScreen");
      
      Alert.alert(
        "Logout Successful",
        "You have been logged out. Redirecting to login screen..."
      );
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Error", "There was an error logging out. Please try again.");
    }
  };

  // Navigate to calendar with specific view
  const navigateToCalendarView = (view: 'daily' | 'weekly' | 'monthly') => {
    router.push({
      pathname: "/(tabs)/calendar",
      params: { view }
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>Welcome to ADHD SecondBrain</Text>
        <Text style={[styles.subtitle, { color: themeColors.subtitle }]}>You are currently logged in</Text>
        
        {/* Calendar Navigation Section */}
        <View style={styles.calendarSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Calendar Views</Text>
          <View style={styles.calendarCards}>
            {/* Daily View Card */}
            <TouchableOpacity 
              style={[styles.calendarCard, { 
                backgroundColor: themeColors.calendarCard,
                borderColor: themeColors.calendarCardBorder 
              }]}
              onPress={() => navigateToCalendarView('daily')}
            >
              <Ionicons name="calendar-outline" size={32} color={themeColors.calendarCardIcon} />
              <Text style={[styles.calendarCardTitle, { color: themeColors.calendarCardText }]}>Daily View</Text>
              <Text style={[styles.calendarCardDesc, { color: themeColors.helpText }]}>
                See your day hour by hour
              </Text>
            </TouchableOpacity>
            
            {/* Weekly View Card */}
            <TouchableOpacity 
              style={[styles.calendarCard, { 
                backgroundColor: themeColors.calendarCard,
                borderColor: themeColors.calendarCardBorder 
              }]}
              onPress={() => navigateToCalendarView('weekly')}
            >
              <Ionicons name="calendar-outline" size={32} color={themeColors.calendarCardIcon} />
              <Text style={[styles.calendarCardTitle, { color: themeColors.calendarCardText }]}>Weekly View</Text>
              <Text style={[styles.calendarCardDesc, { color: themeColors.helpText }]}>
                Plan your entire week
              </Text>
            </TouchableOpacity>
            
            {/* Monthly View Card */}
            <TouchableOpacity 
              style={[styles.calendarCard, { 
                backgroundColor: themeColors.calendarCard,
                borderColor: themeColors.calendarCardBorder 
              }]}
              onPress={() => navigateToCalendarView('monthly')}
            >
              <Ionicons name="calendar" size={32} color={themeColors.calendarCardIcon} />
              <Text style={[styles.calendarCardTitle, { color: themeColors.calendarCardText }]}>Monthly View</Text>
              <Text style={[styles.calendarCardDesc, { color: themeColors.helpText }]}>
                See your month at a glance
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.devSection, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.devNote, { color: themeColors.text }]}>Development Testing:</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <Text style={[styles.helpText, { color: themeColors.helpText }]}>
            Press the logout button to view the authentication screens
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  calendarSection: {
    width: "100%",
    marginBottom: 30,
  },
  calendarCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  calendarCard: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  calendarCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  calendarCardDesc: {
    fontSize: 14,
    textAlign: "center",
  },
  devSection: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  devNote: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  helpText: {
    fontSize: 14,
    textAlign: "center",
  },
});

// screens/AuthLoadingScreen.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
const AuthLoadingScreen: React.FC = () => {
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    indicator: isDark ? Colors.dark.tint : Colors.light.tint,
  };
  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? '/' : '/auth/LoginScreen');
    }
  }, [isLoading, user]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ActivityIndicator size="large" color={themeColors.indicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthLoadingScreen;
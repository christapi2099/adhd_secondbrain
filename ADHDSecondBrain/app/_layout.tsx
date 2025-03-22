import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
// Navigation component that handles conditional rendering based on auth state
function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  // Show a loading screen while checking authentication
  if (isLoading) {
    return (
      <Stack>
        <Stack.Screen name="auth/AuthLoadingScreen" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack>
      {user ? (
        // User is signed in - show main app screens
        <>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
        </>
      ) : (
        // User is not signed in - show auth screens
        <>
          <Stack.Screen name="auth/LoginScreen" options={{ headerShown: false }} />
          <Stack.Screen name="auth/SignupScreen" options={{ title: 'Sign Up' }} />
          <Stack.Screen name="auth/HomeScreen" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}
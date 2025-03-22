// types/navigation.ts (updated for Expo Router)

// Define route paths
export type AppRoutes = {
  '/screens/auth/AuthLoadingScreen': undefined;
  '/screens/auth/LoginScreen': undefined;
  '/screens/auth/SignupScreen': undefined;
  '/screens/auth/HomeScreen': undefined;
  '/(tabs)': undefined;
};

// Helper type for route params
export type RouteParams<T extends keyof AppRoutes> = AppRoutes[T];

// For backward compatibility with any code still using the old navigation types
export type RootStackParamList = {
  AuthLoading: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Main: undefined;
};
// screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { login, googleSignIn, isLoading } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    text: isDark ? Colors.dark.text : Colors.light.text,
    inputBackground: isDark ? '#1C1C1E' : '#fff',
    inputBorder: isDark ? '#38383A' : '#ddd',
    inputText: isDark ? Colors.dark.text : Colors.light.text,
    placeholderText: isDark ? '#9BA1A6' : '#999',
    dividerLine: isDark ? '#38383A' : '#ddd',
    dividerText: isDark ? '#9BA1A6' : '#888',
    googleButtonBg: isDark ? '#1C1C1E' : '#fff',
    googleButtonBorder: isDark ? '#38383A' : '#ddd',
    googleButtonText: isDark ? Colors.dark.text : '#333',
    linkText: isDark ? Colors.dark.tint : Colors.light.tint,
  };

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        Alert.alert('Login Failed', result.error);
      }
    } catch (error) {
      const e = error as Error;
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      const result = await googleSignIn();
      if (!result.success && result.error) {
        Alert.alert('Google Login Failed', result.error);
      }
    } catch (error) {
      const e = error as Error;
      Alert.alert('Google Login Failed', e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={styles.logo}
        />
        <Text style={[styles.appName, { color: themeColors.text }]}>ADHD SecondBrain</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: themeColors.inputBackground,
            borderColor: themeColors.inputBorder,
            color: themeColors.inputText
          }]}
          placeholder="Email"
          placeholderTextColor={themeColors.placeholderText}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, { 
            backgroundColor: themeColors.inputBackground,
            borderColor: themeColors.inputBorder,
            color: themeColors.inputText
          }]}
          placeholder="Password"
          placeholderTextColor={themeColors.placeholderText}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: themeColors.dividerLine }]} />
          <Text style={[styles.dividerText, { color: themeColors.dividerText }]}>OR</Text>
          <View style={[styles.dividerLine, { backgroundColor: themeColors.dividerLine }]} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, { 
            backgroundColor: themeColors.googleButtonBg,
            borderColor: themeColors.googleButtonBorder
          }]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <Text style={[styles.googleButtonText, { color: themeColors.googleButtonText }]}>
            Sign in with Google
          </Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: themeColors.text }]}>
            Don't have an account? 
          </Text>
          <TouchableOpacity onPress={() => router.navigate('/auth/SignupScreen')}>
            <Text style={[styles.signupLink, { color: themeColors.linkText }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007BFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#888',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    marginLeft: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#333',
  },
  signupLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
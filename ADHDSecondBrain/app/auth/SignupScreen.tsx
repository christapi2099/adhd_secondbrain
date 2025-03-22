// screens/SignupScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

const SignupScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { signup, googleSignIn } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    text: isDark ? Colors.dark.text : Colors.light.text,
    titleText: isDark ? Colors.dark.text : '#333',
    subtitleText: isDark ? '#9BA1A6' : '#666',
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

  const handleSignup = async (): Promise<void> => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const result = await signup(email, password);
      if (!result.success && result.error) {
        Alert.alert('Signup Failed', result.error);
      }
    } catch (error) {
      const e = error as Error;
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async (): Promise<void> => {
    try {
      const result = await googleSignIn();
      if (!result.success && result.error) {
        Alert.alert('Google Signup Failed', result.error);
      }
    } catch (error) {
      const e = error as Error;
      Alert.alert('Google Signup Failed', e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.titleText }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: themeColors.subtitleText }]}>Sign up to get started</Text>
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
        <TextInput
          style={[styles.input, { 
            backgroundColor: themeColors.inputBackground,
            borderColor: themeColors.inputBorder,
            color: themeColors.inputText
          }]}
          placeholder="Confirm Password"
          placeholderTextColor={themeColors.placeholderText}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleSignup}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
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
          onPress={handleGoogleSignup}
        >
          <Text style={[styles.googleButtonText, { color: themeColors.googleButtonText }]}>
            Sign up with Google
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: themeColors.text }]}>
            Already have an account? 
          </Text>
          <TouchableOpacity onPress={() => router.navigate('/auth/LoginScreen')}>
            <Text style={[styles.loginLink, { color: themeColors.linkText }]}>Login</Text>
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
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
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
  signupButton: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#333',
  },
  loginLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export default SignupScreen;
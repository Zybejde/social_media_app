import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const navigation = useNavigation();

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Email Required',
        text2: 'Please enter your email address',
        position: 'top',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
        position: 'top',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  const goBack = () => {
    navigation.goBack();
  };

  // Success State
  if (isSuccess) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Back Arrow */}
          <TouchableOpacity style={styles.backArrow} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>

          {/* Success Section */}
          <View style={styles.logoSection}>
            <Text style={styles.appName}>Social<Text style={styles.appNameAccent}>Hub</Text></Text>
            <View style={styles.successIcon}>
              <Ionicons name="mail-outline" size={48} color="#007AFF" />
            </View>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.tagline}>
              {"We've sent a password reset link to:"}
            </Text>
            <Text style={styles.emailHighlight}>{email}</Text>
          </View>

          {/* Info */}
          <View style={styles.form}>
            <Text style={styles.infoText}>
              {"Click the link in the email to reset your password. If you don't see it, check your spam folder."}
            </Text>

            {/* Back to Login Button */}
            <TouchableOpacity style={styles.button} onPress={goBack}>
              <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>

            {/* Resend Link */}
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={() => {
                Toast.show({
                  type: 'success',
                  text1: 'Email Resent',
                  text2: 'Check your inbox for the new link',
                  position: 'top',
                });
              }}
            >
              <Text style={styles.resendText}>{"Didn't receive the email? Resend"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Back Arrow */}
        <TouchableOpacity style={styles.backArrow} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        {/* Logo/Brand Section */}
        <View style={styles.logoSection}>
          <Text style={styles.appName}>Social<Text style={styles.appNameAccent}>Hub</Text></Text>
          <Text style={styles.title}>Forgot password ?</Text>
          <Text style={styles.tagline}>
            {"No worries! Enter your email and we'll send you a reset link."}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Reset Button */}
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send reset link</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // Back Arrow
  backArrow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 24,
    zIndex: 10,
    padding: 4,
  },

  // Logo/Header Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: -1,
  },
  appNameAccent: {
    color: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 8,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  // Form
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  // Button
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    height: 52,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#99c9ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },

  // Info Text
  infoText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },

  // Resend
  resendButton: {
    alignItems: 'center',
  },
  resendText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

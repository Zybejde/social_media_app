import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Toast from 'react-native-toast-message';

// Navigation hook
import { useNavigation } from '@react-navigation/native';

// Import our auth hook
import { useAuth } from '../../store/AuthContext';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// Google Client IDs - From Google Cloud Console
const GOOGLE_CLIENT_ID_WEB = '393111149202-7lmgl03dohc38cm3dnghiakqq88nvkg8.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_IOS = ''; // Add if you want iOS support
const GOOGLE_CLIENT_ID_ANDROID = '393111149202-65jljaimmjksps6pf3ka0id932iofp3c.apps.googleusercontent.com';

export default function SignupScreen() {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Navigation
  const navigation = useNavigation();
  
  // Get the signup function from auth context
  const { signup, loginWithGoogle } = useAuth();

  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID_WEB,
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
  });

  // Handle Google Auth Response
  useEffect(() => {
    const processGoogleAuth = async (accessToken?: string | null) => {
      if (!accessToken) {
        Toast.show({
          type: 'error',
          text1: 'Google Sign-Up Failed',
          text2: 'Failed to get access token',
          position: 'top',
        });
        return;
      }

      setIsGoogleLoading(true);

      try {
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/userinfo/v2/me',
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const userInfo = await userInfoResponse.json();

        const result = await loginWithGoogle({
          email: userInfo.email,
          name: userInfo.name,
          avatar: userInfo.picture,
          googleId: userInfo.id,
        });

        if (!result.success) {
          Toast.show({
            type: 'error',
            text1: 'Google Sign-Up Failed',
            text2: result.error || 'Please try again',
            position: 'top',
          });
        }
      } catch (error) {
        console.error('Google sign up error:', error);
        Toast.show({
          type: 'error',
          text1: 'Google Sign-Up Failed',
          text2: 'An error occurred',
          position: 'top',
        });
      } finally {
        setIsGoogleLoading(false);
      }
    };

    if (response?.type === 'success') {
      processGoogleAuth(response.authentication?.accessToken);
    }
  }, [response, loginWithGoogle]);

  // Handle signup button press
  const handleSignup = async () => {
    // Basic validation
    if (!name || !email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Password',
        text2: 'Password must be at least 6 characters',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);
    
    const result = await signup(name, email, password);
    
    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: result.error || 'Please try again',
        position: 'top',
        visibilityTime: 4000,
      });
    }
    
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.form}>
        <Text style={styles.appName}>Social<Text style={styles.appNameAccent}>Hub</Text></Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our community today</Text>

        {/* Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Signup Button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Sign Up Button */}
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => promptAsync()}
          disabled={!request || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color="#333" />
          ) : (
            <View style={styles.socialButtonContent}>
              <Image 
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Apple Sign Up Button */}
        <TouchableOpacity style={[styles.socialButton, styles.socialButtonApple]}>
          <View style={styles.socialButtonContent}>
            <Ionicons name="logo-apple" size={20} color="#fff" />
            <Text style={[styles.socialButtonText, styles.socialButtonAppleText]}>
              Continue with Apple
            </Text>
          </View>
        </TouchableOpacity>

        {/* Link to go back to Login */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.link}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: -1,
    textAlign: 'center',
  },
  appNameAccent: {
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
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

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },

  // Social Buttons
  socialButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    height: 52,
    justifyContent: 'center',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  socialButtonApple: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  socialButtonAppleText: {
    color: '#fff',
    marginLeft: 8,
  },

  // Login link
  loginLink: {
    marginTop: 8,
  },
  linkText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

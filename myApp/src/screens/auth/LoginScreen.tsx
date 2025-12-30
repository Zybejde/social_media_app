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

// Navigation hook to move between screens
import { useNavigation } from '@react-navigation/native';
// Type for the navigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import our auth hook - THIS IS THE KEY!
import { useAuth } from '../../store/AuthContext';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// Define the screens in Auth flow (for TypeScript)
type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// Google Client IDs - From Google Cloud Console
const GOOGLE_CLIENT_ID_WEB = '393111149202-7lmgl03dohc38cm3dnghiakqq88nvkg8.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_IOS = ''; // Add if you want iOS support
const GOOGLE_CLIENT_ID_ANDROID = '';

export default function LoginScreen() {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Navigation
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  
  // Get the login function from auth context
  const { login, loginWithGoogle } = useAuth();

  // Google Auth Request - uses Expo auth proxy automatically
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID_WEB,
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
          text1: 'Google Sign-In Failed',
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
            text1: 'Google Sign-In Failed',
            text2: result.error || 'Please try again',
            position: 'top',
          });
        }
      } catch (error) {
        console.error('Google sign in error:', error);
        Toast.show({
          type: 'error',
          text1: 'Google Sign-In Failed',
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

  // Handle login button press
  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);
    
    const result = await login(email, password);
    
    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: result.error || 'Please try again',
        position: 'top',
        visibilityTime: 4000,
      });
    }
    
    setIsLoading(false);
  };

  // Navigate to Signup screen
  const goToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo/Brand Section */}
        <View style={styles.logoSection}>
          <Text style={styles.appName}>Social<Text style={styles.appNameAccent}>Hub</Text></Text>
          <Text style={styles.tagline}>Connect with friends & family</Text>
        </View>

        {/* Login Form */}
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

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In Button */}
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

          {/* Apple Sign In Button */}
          <TouchableOpacity style={[styles.socialButton, styles.socialButtonApple]}>
            <View style={styles.socialButtonContent}>
              <Ionicons name="logo-apple" size={20} color="#fff" />
              <Text style={[styles.socialButtonText, styles.socialButtonAppleText]}>
                Continue with Apple
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupSection}>
          <Text style={styles.signupText}>{"Don't have an account? "}</Text>
          <TouchableOpacity onPress={goToSignup}>
            <Text style={styles.signupLink}>Sign Up</Text>
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
  
  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -1,
  },
  appNameAccent: {
    color: '#007AFF',
  },
  tagline: {
    fontSize: 16,
    color: '#666',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Login Button
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    height: 52,
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#99c9ff',
  },
  loginButtonText: {
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

  // Sign Up Section
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 15,
  },
  signupLink: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },

});

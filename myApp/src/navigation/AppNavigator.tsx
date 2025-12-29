import React from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Import screens that appear on top of tabs
import CreatePostScreen from '../screens/home/CreatePostScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import CallScreen from '../screens/messages/CallScreen';
import VideoCallScreen from '../screens/messages/VideoCallScreen';
import NewMessageScreen from '../screens/messages/NewMessageScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

// Import settings sub-screens
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import PrivacyScreen from '../screens/settings/PrivacyScreen';
import NotificationsSettingsScreen from '../screens/settings/NotificationsSettingsScreen';
import AppearanceScreen from '../screens/settings/AppearanceScreen';

// Import auth context
import { AuthProvider, useAuth } from '../store/AuthContext';

// Define the types for our navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  CreatePost: undefined;
  Chat: { user: { _id: string; name: string; avatar: string } };
  Call: { user: { name: string; avatar: string } };
  VideoCall: { user: { name: string; avatar: string } };
  NewMessage: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Privacy: undefined;
  NotificationsSettings: undefined;
  Appearance: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Separate component that uses auth state
// This MUST be inside AuthProvider to access useAuth()
function RootNavigator() {
  // Get isLoggedIn from our auth context
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        // User is logged in → Show main app + any screens on top
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen 
            name="CreatePost" 
            component={CreatePostScreen}
            options={{
              // Make it slide up from bottom like a modal
              presentation: 'transparentModal',
              // Show dark overlay behind the modal
              cardOverlayEnabled: true,
              // Make card background transparent so overlay shows
              cardStyle: { backgroundColor: 'transparent' },
            }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Call" 
            component={CallScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="VideoCall" 
            component={VideoCallScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="NewMessage" 
            component={NewMessageScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ChangePassword" 
            component={ChangePasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Privacy" 
            component={PrivacyScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="NotificationsSettings" 
            component={NotificationsSettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Appearance" 
            component={AppearanceScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        // User is NOT logged in → Show login/signup
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

// Custom Toast Configuration
const toastConfig = {
  // Error toast with red background
  error: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={toastStyles.errorContainer}>
      <View style={toastStyles.iconContainer}>
        <Ionicons name="close-circle" size={24} color="#fff" />
      </View>
      <View style={toastStyles.textContainer}>
        <Text style={toastStyles.errorTitle}>{text1}</Text>
        {text2 && <Text style={toastStyles.errorMessage}>{text2}</Text>}
      </View>
    </View>
  ),
  // Success toast with green background
  success: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={toastStyles.successContainer}>
      <View style={toastStyles.iconContainer}>
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
      </View>
      <View style={toastStyles.textContainer}>
        <Text style={toastStyles.successTitle}>{text1}</Text>
        {text2 && <Text style={toastStyles.successMessage}>{text2}</Text>}
      </View>
    </View>
  ),
};

const toastStyles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorMessage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  successTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  successMessage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
});

// Main AppNavigator wraps everything with providers
export default function AppNavigator() {
  return (
    // SafeAreaProvider handles the status bar space on all devices
    <SafeAreaProvider>
      {/* Configure status bar appearance */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
      {/* Toast notifications - must be at the end */}
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

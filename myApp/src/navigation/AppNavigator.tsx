import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

// Import auth context
import { AuthProvider, useAuth } from '../store/AuthContext';

// Define the types for our navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  CreatePost: undefined;
  Chat: { user: { name: string; avatar: string } };
  Call: { user: { name: string; avatar: string } };
  VideoCall: { user: { name: string; avatar: string } };
  NewMessage: undefined;
  Settings: undefined;
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
        </>
      ) : (
        // User is NOT logged in → Show login/signup
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

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
    </SafeAreaProvider>
  );
}

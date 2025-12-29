import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Import types from AppNavigator
import { RootStackParamList } from './AppNavigator';

const Tab = createBottomTabNavigator();

// Component for the header + button
function CreatePostButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('CreatePost')}
      style={{ marginRight: 16}}
    >
      <Ionicons name="add-circle" size={28} color="#007AFF" />
    </TouchableOpacity>
  );
}

// Settings button for profile header
function SettingsButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Settings')}
      style={{ marginRight: 16 }}
    >
      <Ionicons name="settings-outline" size={24} color="#333" />
    </TouchableOpacity>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          // Choose icon based on route name
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'alert';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {/* headerTitle = only changes top header, NOT bottom tab */}
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          headerTitle: 'Feed',
          // Add a "+" button on the right side of the header
          headerRight: () => <CreatePostButton />,
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ headerTitle: 'Find friends & communities' }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ headerTitle: 'Chats' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ headerTitle: 'Notifications' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          headerTitle: 'My profile',
          headerRight: () => <SettingsButton />,
        }}
      />
    </Tab.Navigator>
  );
}
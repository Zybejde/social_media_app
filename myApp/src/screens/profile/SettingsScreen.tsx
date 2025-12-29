import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import auth context to get logout function
import { useAuth } from '../../store/AuthContext';

// Reusable menu item component
function MenuItem({ 
  icon, 
  label, 
  onPress,
  showBorder = true,
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  label: string; 
  onPress: () => void;
  showBorder?: boolean;
}) {
  return (
    <TouchableOpacity 
      style={[styles.menuItem, !showBorder && styles.menuItemNoBorder]} 
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color="#007AFF" />
        </View>
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

// Section header component
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  // Handle logout button press
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={styles.menuSection}>
          <MenuItem 
            icon="person-outline" 
            label="Edit Profile" 
            onPress={() => console.log('Edit Profile')}
          />
          <MenuItem 
            icon="lock-closed-outline" 
            label="Change Password" 
            onPress={() => console.log('Change Password')}
          />
          <MenuItem 
            icon="shield-checkmark-outline" 
            label="Privacy" 
            onPress={() => console.log('Privacy')}
            showBorder={false}
          />
        </View>

        {/* Content Section */}
        <SectionHeader title="Content" />
        <View style={styles.menuSection}>
          <MenuItem 
            icon="bookmark-outline" 
            label="Saved Posts" 
            onPress={() => console.log('Saved posts')}
          />
          <MenuItem 
            icon="heart-outline" 
            label="Liked Posts" 
            onPress={() => console.log('Liked posts')}
          />
          <MenuItem 
            icon="location-outline" 
            label="Check-ins" 
            onPress={() => console.log('Check-ins')}
            showBorder={false}
          />
        </View>

        {/* Preferences Section */}
        <SectionHeader title="Preferences" />
        <View style={styles.menuSection}>
          <MenuItem 
            icon="notifications-outline" 
            label="Notifications" 
            onPress={() => console.log('Notifications')}
          />
          <MenuItem 
            icon="moon-outline" 
            label="Appearance" 
            onPress={() => console.log('Appearance')}
          />
          <MenuItem 
            icon="language-outline" 
            label="Language" 
            onPress={() => console.log('Language')}
            showBorder={false}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <View style={styles.menuSection}>
          <MenuItem 
            icon="help-circle-outline" 
            label="Help & Support" 
            onPress={() => console.log('Help')}
          />
          <MenuItem 
            icon="document-text-outline" 
            label="Terms of Service" 
            onPress={() => console.log('Terms')}
          />
          <MenuItem 
            icon="information-circle-outline" 
            label="About" 
            onPress={() => console.log('About')}
            showBorder={false}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version info */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerRight: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Menu section
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemNoBorder: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },

  // Logout button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Version
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    paddingVertical: 24,
    paddingBottom: 40,
  },
});


import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import auth context to get logout function
import { useAuth } from '../../store/AuthContext';
import { RootStackParamList } from '../../navigation/AppNavigator';

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const [showLogoutSheet, setShowLogoutSheet] = useState(false);

  // Handle logout confirmation
  const handleConfirmLogout = () => {
    setShowLogoutSheet(false);
    logout();
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
            onPress={() => navigation.navigate('EditProfile')}
          />
          <MenuItem 
            icon="lock-closed-outline" 
            label="Change Password" 
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <MenuItem 
            icon="shield-checkmark-outline" 
            label="Privacy" 
            onPress={() => navigation.navigate('Privacy')}
            showBorder={false}
          />
        </View>

        {/* Preferences Section */}
        <SectionHeader title="Preferences" />
        <View style={styles.menuSection}>
          <MenuItem 
            icon="notifications-outline" 
            label="Notifications" 
            onPress={() => navigation.navigate('NotificationsSettings')}
          />
          <MenuItem 
            icon="moon-outline" 
            label="Appearance" 
            onPress={() => navigation.navigate('Appearance')}
          />
          <MenuItem 
            icon="language-outline" 
            label="Language" 
            onPress={() => Alert.alert('Language', 'More languages coming soon!')}
            showBorder={false}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <View style={styles.menuSection}>
          <MenuItem 
            icon="help-circle-outline" 
            label="Help & Support" 
            onPress={() => Alert.alert('Help & Support', 'Contact us at support@socialhub.com')}
          />
          <MenuItem 
            icon="document-text-outline" 
            label="Terms of Service" 
            onPress={() => Alert.alert('Terms of Service', 'Our terms and conditions will be displayed here')}
          />
          <MenuItem 
            icon="information-circle-outline" 
            label="About" 
            onPress={() => Alert.alert('About SocialHub', 'Version 1.0.0\n\nBuilt with ❤️ using React Native')}
            showBorder={false}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutSheet(true)}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version info */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      {/* Logout Bottom Sheet */}
      <Modal
        visible={showLogoutSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLogoutSheet(false)}
      >
        <TouchableOpacity 
          style={styles.sheetOverlay} 
          activeOpacity={1}
          onPress={() => setShowLogoutSheet(false)}
        >
          <View style={styles.sheetContainer}>
            {/* Handle bar */}
            <View style={styles.sheetHandle} />
            
            {/* Icon */}
            <View style={styles.sheetIconContainer}>
              <Ionicons name="log-out-outline" size={32} color="#FF3B30" />
            </View>
            
            {/* Title & Message */}
            <Text style={styles.sheetTitle}>Logout</Text>
            <Text style={styles.sheetMessage}>Are you sure you want to logout?</Text>
            
            {/* Buttons */}
            <View style={styles.sheetButtons}>
              <TouchableOpacity 
                style={styles.sheetCancelBtn}
                onPress={() => setShowLogoutSheet(false)}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sheetLogoutBtn}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.sheetLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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

  // Bottom Sheet Styles
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 20,
  },
  sheetIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sheetMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  sheetCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  sheetCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  sheetLogoutBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  sheetLogoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});


import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type ThemeOption = 'light' | 'dark' | 'system';

export default function AppearanceScreen() {
  const navigation = useNavigation();

  const [theme, setTheme] = useState<ThemeOption>('system');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const ThemeOption = ({ 
    value, 
    icon, 
    label 
  }: { 
    value: ThemeOption; 
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }) => (
    <TouchableOpacity 
      style={[styles.themeOption, theme === value && styles.themeOptionActive]}
      onPress={() => setTheme(value)}
    >
      <View style={[styles.themeIconContainer, theme === value && styles.themeIconActive]}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={theme === value ? '#fff' : '#666'} 
        />
      </View>
      <Text style={[styles.themeLabel, theme === value && styles.themeLabelActive]}>
        {label}
      </Text>
      {theme === value && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const FontSizeOption = ({ 
    value, 
    label, 
    size 
  }: { 
    value: 'small' | 'medium' | 'large';
    label: string;
    size: number;
  }) => (
    <TouchableOpacity 
      style={[styles.fontOption, fontSize === value && styles.fontOptionActive]}
      onPress={() => setFontSize(value)}
    >
      <Text style={[styles.fontPreview, { fontSize: size }]}>Aa</Text>
      <Text style={styles.fontLabel}>{label}</Text>
      {fontSize === value && (
        <View style={styles.fontCheckmark}>
          <Ionicons name="checkmark" size={18} color="#007AFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Theme Section */}
        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.section}>
          <ThemeOption value="light" icon="sunny" label="Light" />
          <View style={styles.divider} />
          <ThemeOption value="dark" icon="moon" label="Dark" />
          <View style={styles.divider} />
          <ThemeOption value="system" icon="phone-portrait" label="System" />
        </View>

        {/* Font Size Section */}
        <Text style={styles.sectionTitle}>Font Size</Text>
        <View style={styles.fontSection}>
          <FontSizeOption value="small" label="Small" size={14} />
          <FontSizeOption value="medium" label="Medium" size={18} />
          <FontSizeOption value="large" label="Large" size={22} />
        </View>

        {/* Preview */}
        <Text style={styles.sectionTitle}>Preview</Text>
        <View style={styles.previewSection}>
          <View style={styles.previewPost}>
            <View style={styles.previewHeader}>
              <View style={styles.previewAvatar} />
              <View>
                <Text style={styles.previewName}>John Doe</Text>
                <Text style={styles.previewTime}>2 hours ago</Text>
              </View>
            </View>
            <Text style={styles.previewContent}>
              This is how your posts will look with the current settings. 
              Adjust the theme and font size to your preference.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
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

  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  themeOptionActive: {
    backgroundColor: '#f8f8f8',
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  themeIconActive: {
    backgroundColor: '#007AFF',
  },
  themeLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  themeLabelActive: {
    fontWeight: '600',
  },
  checkmark: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 70,
  },

  // Font size
  fontSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
  },
  fontOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fontOptionActive: {
    borderColor: '#007AFF',
  },
  fontPreview: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  fontLabel: {
    fontSize: 13,
    color: '#666',
  },
  fontCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Preview
  previewSection: {
    marginHorizontal: 16,
  },
  previewPost: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    marginRight: 12,
  },
  previewName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  previewTime: {
    fontSize: 13,
    color: '#999',
  },
  previewContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
});


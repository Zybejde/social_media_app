import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyScreen() {
  const navigation = useNavigation();

  // Privacy settings state
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [allowTagging, setAllowTagging] = useState(true);
  const [allowMentions, setAllowMentions] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Privacy */}
        <Text style={styles.sectionTitle}>Account Privacy</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Private Account</Text>
              <Text style={styles.settingDescription}>
                Only followers can see your posts
              </Text>
            </View>
            <Switch
              value={privateAccount}
              onValueChange={setPrivateAccount}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Activity Status */}
        <Text style={styles.sectionTitle}>Activity Status</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Online Status</Text>
              <Text style={styles.settingDescription}>
                Let others see when you are online
              </Text>
            </View>
            <Switch
              value={showOnlineStatus}
              onValueChange={setShowOnlineStatus}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Last Seen</Text>
              <Text style={styles.settingDescription}>
                Let others see when you were last active
              </Text>
            </View>
            <Switch
              value={showLastSeen}
              onValueChange={setShowLastSeen}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Activity Status</Text>
              <Text style={styles.settingDescription}>
                Show when you are typing or viewing stories
              </Text>
            </View>
            <Switch
              value={showActivityStatus}
              onValueChange={setShowActivityStatus}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Interactions */}
        <Text style={styles.sectionTitle}>Interactions</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Allow Tagging</Text>
              <Text style={styles.settingDescription}>
                Let others tag you in photos
              </Text>
            </View>
            <Switch
              value={allowTagging}
              onValueChange={setAllowTagging}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Allow Mentions</Text>
              <Text style={styles.settingDescription}>
                Let others mention you in posts
              </Text>
            </View>
            <Switch
              value={allowMentions}
              onValueChange={setAllowMentions}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Data & Account</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerRow}>
            <Text style={styles.dangerLabel}>Download My Data</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.dangerRow}>
            <Text style={[styles.dangerLabel, styles.deleteLabel]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 16,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dangerLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  deleteLabel: {
    color: '#FF3B30',
  },
});


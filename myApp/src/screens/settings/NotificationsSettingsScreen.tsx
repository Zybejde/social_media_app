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

export default function NotificationsSettingsScreen() {
  const navigation = useNavigation();

  // Notification settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [likes, setLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [follows, setFollows] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [messages, setMessages] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Push Notifications */}
        <Text style={styles.sectionTitle}>Push Notifications</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications" size={20} color="#007AFF" />
              </View>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Activity Notifications */}
        <Text style={styles.sectionTitle}>Activity</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFE5E5' }]}>
                <Ionicons name="heart" size={18} color="#FF3B30" />
              </View>
              <Text style={styles.settingLabel}>Likes</Text>
            </View>
            <Switch
              value={likes}
              onValueChange={setLikes}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
              disabled={!pushEnabled}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: '#E5F0FF' }]}>
                <Ionicons name="chatbubble" size={18} color="#007AFF" />
              </View>
              <Text style={styles.settingLabel}>Comments</Text>
            </View>
            <Switch
              value={comments}
              onValueChange={setComments}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
              disabled={!pushEnabled}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: '#E5FFE5' }]}>
                <Ionicons name="person-add" size={18} color="#34C759" />
              </View>
              <Text style={styles.settingLabel}>New Followers</Text>
            </View>
            <Switch
              value={follows}
              onValueChange={setFollows}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
              disabled={!pushEnabled}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF5E5' }]}>
                <Ionicons name="at" size={18} color="#FF9500" />
              </View>
              <Text style={styles.settingLabel}>Mentions</Text>
            </View>
            <Switch
              value={mentions}
              onValueChange={setMentions}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
              disabled={!pushEnabled}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: '#F0E5FF' }]}>
                <Ionicons name="mail" size={18} color="#AF52DE" />
              </View>
              <Text style={styles.settingLabel}>Direct Messages</Text>
            </View>
            <Switch
              value={messages}
              onValueChange={setMessages}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
              disabled={!pushEnabled}
            />
          </View>
        </View>

        {/* Sound & Haptics */}
        <Text style={styles.sectionTitle}>Sound & Haptics</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="volume-high" size={18} color="#007AFF" />
              </View>
              <Text style={styles.settingLabel}>Sound</Text>
            </View>
            <Switch
              value={sound}
              onValueChange={setSound}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="phone-portrait" size={18} color="#007AFF" />
              </View>
              <Text style={styles.settingLabel}>Vibration</Text>
            </View>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Email */}
        <Text style={styles.sectionTitle}>Email</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={18} color="#007AFF" />
              </View>
              <Text style={styles.settingLabel}>Email Notifications</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="#fff"
            />
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 60,
  },
});


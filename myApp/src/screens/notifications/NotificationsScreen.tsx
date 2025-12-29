import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

// Notification types
type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'message';

interface Notification {
  id: string;
  type: NotificationType;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  content?: string;
  postId?: string;
  createdAt: string;
  isRead: boolean;
}

// Mock notifications data (in a real app, this would come from API)
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: { _id: '1', name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/100?img=1' },
    content: 'liked your post',
    postId: '1',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    isRead: false,
  },
  {
    id: '2',
    type: 'follow',
    user: { _id: '2', name: 'Mike Chen', avatar: 'https://i.pravatar.cc/100?img=2' },
    content: 'started following you',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    isRead: false,
  },
  {
    id: '3',
    type: 'comment',
    user: { _id: '3', name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/100?img=3' },
    content: 'commented on your post: "Great post! 🔥"',
    postId: '2',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    isRead: true,
  },
  {
    id: '4',
    type: 'like',
    user: { _id: '4', name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/100?img=4' },
    content: 'liked your post',
    postId: '1',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    isRead: true,
  },
  {
    id: '5',
    type: 'message',
    user: { _id: '5', name: 'Jessica Lee', avatar: 'https://i.pravatar.cc/100?img=5' },
    content: 'sent you a message',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    isRead: true,
  },
  {
    id: '6',
    type: 'follow',
    user: { _id: '6', name: 'David Kim', avatar: 'https://i.pravatar.cc/100?img=6' },
    content: 'started following you',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    isRead: true,
  },
  {
    id: '7',
    type: 'mention',
    user: { _id: '7', name: 'Sophia Martinez', avatar: 'https://i.pravatar.cc/100?img=7' },
    content: 'mentioned you in a comment',
    postId: '3',
    createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    isRead: true,
  },
];

// Format time helper
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
};

// Get icon for notification type
const getNotificationIcon = (type: NotificationType): { name: string; color: string } => {
  switch (type) {
    case 'like':
      return { name: 'heart', color: '#E91E63' };
    case 'comment':
      return { name: 'chatbubble', color: '#2196F3' };
    case 'follow':
      return { name: 'person-add', color: '#4CAF50' };
    case 'mention':
      return { name: 'at', color: '#9C27B0' };
    case 'message':
      return { name: 'mail', color: '#FF9800' };
    default:
      return { name: 'notifications', color: '#666' };
  }
};

// Notification Item Component
function NotificationItem({ 
  notification, 
  onPress 
}: { 
  notification: Notification;
  onPress: () => void;
}) {
  const icon = getNotificationIcon(notification.type);
  
  return (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadItem
      ]}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: notification.user.avatar }} style={styles.avatar} />
        <View style={[styles.iconBadge, { backgroundColor: icon.color }]}>
          <Ionicons name={icon.name as any} size={12} color="#fff" />
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.notificationText}>
          <Text style={styles.userName}>{notification.user.name}</Text>
          {' '}{notification.content}
        </Text>
        <Text style={styles.timeText}>{formatTime(notification.createdAt)}</Text>
      </View>
      
      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setNotifications(MOCK_NOTIFICATIONS);
    setIsRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );

    // Navigate based on type
    switch (notification.type) {
      case 'message':
        navigation.navigate('Chat', {
          user: {
            _id: notification.user._id,
            name: notification.user.name,
            avatar: notification.user.avatar,
          }
        });
        break;
      case 'follow':
        // Could navigate to user profile
        break;
      default:
        // Could navigate to post
        break;
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      {/* Header with Mark All Read */}
      {unreadCount > 0 && (
        <View style={styles.header}>
          <Text style={styles.unreadText}>{unreadCount} new notifications</Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markReadText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem 
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
              When someone likes, comments, or follows you, it will show up here
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  unreadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  markReadText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },

  // Notification Item
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  unreadItem: {
    backgroundColor: '#f0f7ff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  userName: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  timeText: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 78,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});


import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

// Import API
import { messagesAPI, Conversation } from '../../api';

// Format date helper
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Local conversation type
interface LocalConversation {
  id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
    isOnline?: boolean;
  };
  lastMessage: string;
  time: string;
  unread: boolean;
  unreadCount: number;
}

// Convert API conversation to local format
const convertConversation = (conv: Conversation): LocalConversation => ({
  id: conv._id,
  user: {
    _id: conv.user._id,
    name: conv.user.name,
    avatar: conv.user.avatar,
    isOnline: conv.user.isOnline,
  },
  lastMessage: conv.lastMessage.content,
  time: formatDate(conv.lastMessage.createdAt),
  unread: conv.unreadCount > 0,
  unreadCount: conv.unreadCount,
});

// Component for each conversation item
function ConversationItem({ 
  conversation, 
  onPress 
}: { 
  conversation: LocalConversation;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={onPress}
    >
      {/* Avatar with online indicator */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: conversation.user.avatar }} style={styles.avatar} />
        {conversation.user.isOnline && (
          <View style={styles.onlineIndicator} />
        )}
      </View>

      {/* Conversation details */}
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text 
            style={[
              styles.userName, 
              conversation.unread && styles.userNameUnread
            ]}
          >
            {conversation.user.name}
          </Text>
          <Text style={styles.time}>{conversation.time}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.lastMessage,
              conversation.unread && styles.lastMessageUnread
            ]} 
            numberOfLines={1}
          >
            {conversation.lastMessage}
          </Text>
          
          {/* Unread badge */}
          {conversation.unread && conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch conversations from API
  const fetchConversations = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    try {
      const response = await messagesAPI.getConversations();
      
      if (response.data?.conversations) {
        setConversations(response.data.conversations.map(convertConversation));
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch conversations on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  // Pull to refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchConversations(false);
  };

  const openChat = (user: { _id: string; name: string; avatar: string }) => {
    navigation.navigate('Chat', { user });
  };

  const openNewMessage = () => {
    navigation.navigate('NewMessage');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Conversations list */}
      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <ConversationItem 
            conversation={item} 
            onPress={() => openChat(item.user)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation with someone!
            </Text>
          </View>
        }
      />

      {/* Floating button - must be after FlatList to be on top */}
      <TouchableOpacity style={styles.newMessageButton} onPress={openNewMessage}>
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  newMessageButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 18,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    zIndex: 100,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },

  // Conversation item
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 14,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  userNameUnread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 13,
    color: '#999',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 15,
    color: '#666',
  },
  lastMessageUnread: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 90,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#999',
    marginTop: 8,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Import API and Auth
import { usersAPI } from '../../api';
import { useAuth } from '../../store/AuthContext';

// User type for this screen
interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  followers?: string[];
  following?: string[];
  isOnline?: boolean;
}

// User Card Component
function UserCard({ 
  user, 
  isFollowing,
  onFollow,
  onUnfollow,
  isLoading,
}: { 
  user: SearchUser;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  isLoading: boolean;
}) {
  return (
    <View style={styles.userCard}>
      {/* Avatar with online indicator */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        {user.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      {/* User info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userHandle}>@{user.email.split('@')[0]}</Text>
        {user.bio && (
          <Text style={styles.userBio} numberOfLines={1}>{user.bio}</Text>
        )}
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            <Text style={styles.statNumber}>{user.followers?.length || 0}</Text> followers
          </Text>
          <Text style={styles.statDot}>•</Text>
          <Text style={styles.statText}>
            <Text style={styles.statNumber}>{user.following?.length || 0}</Text> following
          </Text>
        </View>
      </View>
      
      {/* Follow/Unfollow button */}
      <TouchableOpacity 
        style={[
          styles.followButton,
          isFollowing && styles.followingButton
        ]}
        onPress={isFollowing ? onUnfollow : onFollow}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isFollowing ? '#007AFF' : '#fff'} />
        ) : (
          <Text style={[
            styles.followButtonText,
            isFollowing && styles.followingButtonText
          ]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Main Search Screen
export default function SearchScreen() {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      const response = await usersAPI.getUsers(searchQuery);
      
      if (response.data?.users) {
        setUsers(response.data.users);
        
        // Get the IDs of users that the current user is following
        const followingSet = new Set<string>();
        response.data.users.forEach((user: SearchUser) => {
          if (user.followers?.includes(currentUser?.id || '')) {
            followingSet.add(user._id);
          }
        });
        setFollowingIds(followingSet);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [searchQuery, currentUser?.id]);

  // Fetch users when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  // Handle follow
  const handleFollow = async (userId: string) => {
    setLoadingUsers(prev => new Set(prev).add(userId));
    
    try {
      const response = await usersAPI.followUser(userId);
      
      if (response.data) {
        setFollowingIds(prev => new Set(prev).add(userId));
        // Update the user's followers count locally
        setUsers(prev => prev.map(u => 
          u._id === userId 
            ? { ...u, followers: [...(u.followers || []), currentUser?.id || ''] }
            : u
        ));
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
      Alert.alert('Error', 'Failed to follow user');
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Handle unfollow
  const handleUnfollow = async (userId: string) => {
    setLoadingUsers(prev => new Set(prev).add(userId));
    
    try {
      const response = await usersAPI.unfollowUser(userId);
      
      if (response.data) {
        setFollowingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        // Update the user's followers count locally
        setUsers(prev => prev.map(u => 
          u._id === userId 
            ? { ...u, followers: (u.followers || []).filter(id => id !== currentUser?.id) }
            : u
        ));
      }
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      Alert.alert('Error', 'Failed to unfollow user');
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Users List */}
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserCard 
            user={item}
            isFollowing={followingIds.has(item._id)}
            onFollow={() => handleFollow(item._id)}
            onUnfollow={() => handleUnfollow(item._id)}
            isLoading={loadingUsers.has(item._id)}
          />
        )}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'No other users yet'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          !searchQuery && users.length > 0 ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Suggested for you</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  
  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  
  // Section header
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userHandle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userBio: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
  statNumber: {
    fontWeight: '600',
    color: '#666',
  },
  statDot: {
    marginHorizontal: 6,
    color: '#ccc',
  },
  
  // Follow button
  followButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  followingButtonText: {
    color: '#007AFF',
  },
  
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

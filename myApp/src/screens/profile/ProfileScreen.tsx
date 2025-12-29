import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Import auth context and API
import { useAuth } from '../../store/AuthContext';
import { postsAPI, Post } from '../../api';

// Tab types
type TabType = 'posts' | 'saved' | 'liked';

// Post item type
interface PostItem {
  id: string;
  image: string;
}

// Convert API post to grid item
const convertToGridItem = (post: Post): PostItem => ({
  id: post._id,
  image: post.image || `https://picsum.photos/200/200?random=${post._id}`,
});

export default function ProfileScreen() {
  // Get user data from auth context
  const { user } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  
  // Posts state
  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostItem[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch posts on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadPosts = async () => {
        setIsLoading(true);
        try {
          const [postsRes, savedRes, likedRes] = await Promise.all([
            user?.id ? postsAPI.getUserPosts(user.id) : Promise.resolve({ data: { posts: [] } }),
            postsAPI.getSavedPosts(),
            postsAPI.getLikedPosts(),
          ]);

          if (postsRes.data?.posts) {
            setMyPosts(postsRes.data.posts.map(convertToGridItem));
          }
          if (savedRes.data?.posts) {
            setSavedPosts(savedRes.data.posts.map(convertToGridItem));
          }
          if (likedRes.data?.posts) {
            setLikedPosts(likedRes.data.posts.map(convertToGridItem));
          }
        } catch (error) {
          console.error('Failed to fetch posts:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadPosts();
    }, [user?.id])
  );

  // Pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [postsRes, savedRes, likedRes] = await Promise.all([
        user?.id ? postsAPI.getUserPosts(user.id) : Promise.resolve({ data: { posts: [] } }),
        postsAPI.getSavedPosts(),
        postsAPI.getLikedPosts(),
      ]);

      if (postsRes.data?.posts) {
        setMyPosts(postsRes.data.posts.map(convertToGridItem));
      }
      if (savedRes.data?.posts) {
        setSavedPosts(savedRes.data.posts.map(convertToGridItem));
      }
      if (likedRes.data?.posts) {
        setLikedPosts(likedRes.data.posts.map(convertToGridItem));
      }
    } catch (error) {
      console.error('Failed to refresh posts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get current posts based on active tab
  const getCurrentPosts = () => {
    switch (activeTab) {
      case 'posts':
        return myPosts;
      case 'saved':
        return savedPosts;
      case 'liked':
        return likedPosts;
      default:
        return myPosts;
    }
  };

  // Get empty state message based on active tab
  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'posts':
        return { title: 'No Posts Yet', subtitle: 'Share your first post!' };
      case 'saved':
        return { title: 'No Saved Posts', subtitle: 'Posts you save will appear here' };
      case 'liked':
        return { title: 'No Liked Posts', subtitle: 'Posts you like will appear here' };
      default:
        return { title: 'No Posts', subtitle: '' };
    }
  };

  const renderPostItem = ({ item }: { item: PostItem }) => (
    <TouchableOpacity style={styles.postItem}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
    </TouchableOpacity>
  );

  const currentPosts = getCurrentPosts();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user?.avatar || 'https://i.pravatar.cc/200?img=5' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* User name and handle */}
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userHandle}>@{user?.email?.split('@')[0] || 'user'}</Text>

        {/* Bio */}
        <Text style={styles.bio}>
          {user?.bio || '📱 React Native Developer\n🌍 Building awesome apps\n☕ Coffee enthusiast'}
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{myPosts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </TouchableOpacity>
        
        <View style={styles.statDivider} />
        
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        
        <View style={styles.statDivider} />
        
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Posts Grid Header - Tabs */}
      <View style={styles.postsHeader}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'posts' && styles.tabButtonActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Ionicons 
            name="grid-outline" 
            size={22} 
            color={activeTab === 'posts' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabLabel, activeTab === 'posts' && styles.tabLabelActive]}>
            Posts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'saved' && styles.tabButtonActive]}
          onPress={() => setActiveTab('saved')}
        >
          <Ionicons 
            name="bookmark-outline" 
            size={22} 
            color={activeTab === 'saved' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabLabel, activeTab === 'saved' && styles.tabLabelActive]}>
            Saved
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'liked' && styles.tabButtonActive]}
          onPress={() => setActiveTab('liked')}
        >
          <Ionicons 
            name="heart-outline" 
            size={22} 
            color={activeTab === 'liked' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabLabel, activeTab === 'liked' && styles.tabLabelActive]}>
            Liked
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts Grid or Empty State */}
      {currentPosts.length > 0 ? (
        <FlatList
          data={currentPosts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={styles.postsGrid}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons 
            name={activeTab === 'posts' ? 'images-outline' : activeTab === 'saved' ? 'bookmark-outline' : 'heart-outline'} 
            size={64} 
            color="#ccc" 
          />
          <Text style={styles.emptyTitle}>{getEmptyMessage().title}</Text>
          <Text style={styles.emptySubtitle}>{getEmptyMessage().subtitle}</Text>
        </View>
      )}
    </ScrollView>
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

  // Header section
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },

  // Stats section
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },

  // Posts header tabs
  postsHeader: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },

  // Posts grid
  postsGrid: {
    paddingBottom: 20,
  },
  postItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
  },
  postImage: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  },
});

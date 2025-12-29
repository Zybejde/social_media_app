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
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

// Import auth context and API
import { useAuth } from '../../store/AuthContext';
import { postsAPI, usersAPI, Post } from '../../api';

// Tab types
type TabType = 'posts' | 'saved' | 'liked';

// Post item type
interface PostItem {
  id: string;
  image?: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  likes: number;
  comments: number;
  createdAt: string;
}

// User type for followers/following
interface FollowUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
}

// Convert API post to post card item
const convertToPostItem = (post: Post): PostItem => ({
  id: post._id,
  image: post.image || undefined,
  content: post.content || '',
  authorName: post.author?.name || 'User',
  authorAvatar: post.author?.avatar || 'https://i.pravatar.cc/100',
  likes: post.likes?.length || 0,
  comments: post.comments?.length || 0,
  createdAt: post.createdAt || new Date().toISOString(),
});

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Get user data from auth context
  const { user } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  
  // Posts state
  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostItem[]>([]);
  
  // Followers/Following state
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null);
  
  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unfollowingIds, setUnfollowingIds] = useState<Set<string>>(new Set());

  // Fetch all data
  const loadData = useCallback(async () => {
    try {
      const [postsRes, savedRes, likedRes] = await Promise.all([
        user?.id ? postsAPI.getUserPosts(user.id) : Promise.resolve({ data: { posts: [] } }),
        postsAPI.getSavedPosts(),
        postsAPI.getLikedPosts(),
      ]);

      if (postsRes.data?.posts) {
        setMyPosts(postsRes.data.posts.map(convertToPostItem));
      }
      if (savedRes.data?.posts) {
        setSavedPosts(savedRes.data.posts.map(convertToPostItem));
      }
      if (likedRes.data?.posts) {
        setLikedPosts(likedRes.data.posts.map(convertToPostItem));
      }

      // Fetch followers and following
      if (user?.id) {
        const [followersRes, followingRes] = await Promise.all([
          usersAPI.getFollowers(user.id),
          usersAPI.getFollowing(user.id),
        ]);

        if (followersRes.data?.followers) {
          setFollowers(followersRes.data.followers);
        }
        if (followingRes.data?.following) {
          setFollowing(followingRes.data.following);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, [user?.id]);

  // Fetch posts on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Handle unfollow
  const handleUnfollow = async (userId: string) => {
    setUnfollowingIds(prev => new Set(prev).add(userId));
    
    try {
      await usersAPI.unfollowUser(userId);
      setFollowing(prev => prev.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Failed to unfollow:', error);
      Alert.alert('Error', 'Failed to unfollow user');
    } finally {
      setUnfollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Open chat with user
  const openChat = (user: FollowUser) => {
    setShowFollowModal(null);
    navigation.navigate('Chat', {
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
      }
    });
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

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderPostItem = ({ item }: { item: PostItem }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postCardHeader}>
        <Image source={{ uri: item.authorAvatar }} style={styles.postCardAvatar} />
        <View style={styles.postCardHeaderText}>
          <Text style={styles.postCardAuthor}>{item.authorName}</Text>
          <Text style={styles.postCardTime}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
      </View>

      {/* Post Content */}
      <Text style={styles.postCardContent}>{item.content}</Text>

      {/* Post Image (if exists) */}
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postCardImage} />
      )}

      {/* Post Footer */}
      <View style={styles.postCardFooter}>
        <View style={styles.postCardStat}>
          <Ionicons name="heart-outline" size={18} color="#666" />
          <Text style={styles.postCardStatText}>{item.likes}</Text>
        </View>
        <View style={styles.postCardStat}>
          <Ionicons name="chatbubble-outline" size={18} color="#666" />
          <Text style={styles.postCardStatText}>{item.comments}</Text>
        </View>
      </View>
    </View>
  );

  // Render follow user item
  const renderFollowUser = ({ item }: { item: FollowUser }) => (
    <View style={styles.followUserItem}>
      <TouchableOpacity 
        style={styles.followUserInfo}
        onPress={() => openChat(item)}
      >
        <Image source={{ uri: item.avatar }} style={styles.followUserAvatar} />
        <View style={styles.followUserText}>
          <Text style={styles.followUserName}>{item.name}</Text>
          <Text style={styles.followUserHandle}>@{item.email.split('@')[0]}</Text>
        </View>
      </TouchableOpacity>
      
      {showFollowModal === 'following' && (
        <TouchableOpacity 
          style={styles.unfollowButton}
          onPress={() => handleUnfollow(item._id)}
          disabled={unfollowingIds.has(item._id)}
        >
          {unfollowingIds.has(item._id) ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.unfollowButtonText}>Unfollow</Text>
          )}
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.messageButton}
        onPress={() => openChat(item)}
      >
        <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const currentPosts = getCurrentPosts();

  return (
    <>
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
          
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => setShowFollowModal('followers')}
          >
            <Text style={styles.statNumber}>{followers.length}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          
          <View style={styles.statDivider} />
          
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => setShowFollowModal('following')}
          >
            <Text style={styles.statNumber}>{following.length}</Text>
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
            scrollEnabled={false}
            contentContainerStyle={styles.postsList}
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

      {/* Followers/Following Modal */}
      <Modal
        visible={showFollowModal !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFollowModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showFollowModal === 'followers' ? 'Followers' : 'Following'}
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setShowFollowModal(null)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Users List */}
            <FlatList
              data={showFollowModal === 'followers' ? followers : following}
              renderItem={renderFollowUser}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.followList}
              ListEmptyComponent={
                <View style={styles.emptyFollowState}>
                  <Ionicons 
                    name={showFollowModal === 'followers' ? 'people-outline' : 'person-add-outline'} 
                    size={48} 
                    color="#ccc" 
                  />
                  <Text style={styles.emptyFollowTitle}>
                    {showFollowModal === 'followers' 
                      ? 'No followers yet' 
                      : 'Not following anyone'}
                  </Text>
                  <Text style={styles.emptyFollowSubtitle}>
                    {showFollowModal === 'followers' 
                      ? 'When people follow you, they will appear here' 
                      : 'Find people to follow in the Search tab'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
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

  // Posts list
  postsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  postCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postCardHeaderText: {
    flex: 1,
  },
  postCardAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  postCardTime: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  postCardContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  postCardImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  postCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  postCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  postCardStatText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalCloseBtn: {
    padding: 4,
  },

  // Follow list styles
  followList: {
    paddingVertical: 8,
  },
  followUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  followUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  followUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  followUserText: {
    marginLeft: 12,
    flex: 1,
  },
  followUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  followUserHandle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  unfollowButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  unfollowButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  messageButton: {
    padding: 8,
  },

  // Empty follow state
  emptyFollowState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyFollowTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyFollowSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

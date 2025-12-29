import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Image,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Import API
import { postsAPI, Post as ApiPost, Comment as ApiComment } from '../../api';
import { useAuth } from '../../store/AuthContext';

// Local Post type for UI
interface Post {
  id: string;
  author: { name: string; avatar: string; _id?: string };
  content: string;
  likes: number;
  comments: {
    id: string;
    author: string;
    avatar: string;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
  isLiked: boolean;
}

// Convert API post to local format
const convertPost = (apiPost: ApiPost): Post => ({
  id: apiPost._id,
  author: {
    name: apiPost.author.name,
    avatar: apiPost.author.avatar,
    _id: apiPost.author._id,
  },
  content: apiPost.content,
  likes: apiPost.likesCount || apiPost.likes?.length || 0,
  comments: apiPost.comments.map((c: ApiComment) => ({
    id: c._id,
    author: c.user.name,
    avatar: c.user.avatar,
    text: c.text,
    createdAt: formatDate(c.createdAt),
  })),
  createdAt: formatDate(apiPost.createdAt),
  isLiked: apiPost.isLiked || false,
});

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

// PostCard component
function PostCard({ 
  post, 
  onLike, 
  onComment, 
  onShare 
}: { 
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.authorName}>{post.author.name}</Text>
          <Text style={styles.timestamp}>{post.createdAt}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Ionicons 
            name={post.isLiked ? "heart" : "heart-outline"} 
            size={22} 
            color={post.isLiked ? "#E91E63" : "#666"} 
          />
          <Text style={[styles.actionText, post.isLiked && styles.actionTextLiked]}>
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Comments Modal Component
function CommentsModal({
  visible,
  post,
  onClose,
  onAddComment,
  isSubmitting,
}: {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onAddComment: (postId: string, comment: string) => void;
  isSubmitting: boolean;
}) {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const handleSubmit = () => {
    if (newComment.trim() && post) {
      onAddComment(post.id, newComment.trim());
      setNewComment('');
    }
  };

  if (!post) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Drag Handle */}
          <TouchableOpacity onPress={onClose} style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </TouchableOpacity>

          {/* Comments List */}
          <FlatList
            data={post.comments}
            keyExtractor={(item) => item.id}
            style={styles.commentsList}
            ListEmptyComponent={
              <View style={styles.emptyComments}>
                <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Be the first to comment!</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentAuthor}>{item.author}</Text>
                    <Text style={styles.commentText}>{item.text}</Text>
                  </View>
                  <Text style={styles.commentTime}>{item.createdAt}</Text>
                </View>
              </View>
            )}
          />

          {/* Add Comment Input */}
          <View style={styles.addCommentContainer}>
            <Image 
              source={{ uri: user?.avatar || 'https://i.pravatar.cc/100?img=5' }} 
              style={styles.commentInputAvatar} 
            />
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor="#999"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              editable={!isSubmitting}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!newComment.trim() || isSubmitting) && styles.sendButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={newComment.trim() ? "#007AFF" : "#ccc"} 
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch posts from API
  const fetchPosts = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    try {
      const response = await postsAPI.getFeed();
      
      if (response.data?.posts) {
        setPosts(response.data.posts.map(convertPost));
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch posts on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  // Pull to refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPosts(false);
  };

  const handleLike = async (postId: string) => {
    // Optimistic update
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );

    // Call API
    try {
      await postsAPI.toggleLike(postId);
    } catch (error) {
      // Revert on error
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            };
          }
          return post;
        })
      );
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = (post: Post) => {
    setSelectedPost(post);
    setCommentsModalVisible(true);
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    setIsSubmittingComment(true);
    
    try {
      const response = await postsAPI.addComment(postId, commentText);
      
      if (response.data?.comment) {
        const newComment = {
          id: response.data.comment._id,
          author: response.data.comment.user.name,
          avatar: response.data.comment.user.avatar,
          text: response.data.comment.text,
          createdAt: 'Just now',
        };

        // Update posts list
        setPosts(currentPosts =>
          currentPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [...post.comments, newComment],
              };
            }
            return post;
          })
        );

        // Update selected post in modal
        setSelectedPost(prev => {
          if (prev && prev.id === postId) {
            return {
              ...prev,
              comments: [...prev.comments, newComment],
            };
          }
          return prev;
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await Share.share({
        message: `${post.author.name} shared:\n\n"${post.content}"`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share this post');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard 
            post={item}
            onLike={() => handleLike(item.id)}
            onComment={() => handleComment(item)}
            onShare={() => handleShare(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
            <Ionicons name="newspaper-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to share something!</Text>
          </View>
        }
      />

      {/* Comments Modal */}
      <CommentsModal
        visible={commentsModalVisible}
        post={selectedPost}
        onClose={() => {
          setCommentsModalVisible(false);
          setSelectedPost(null);
        }}
        onAddComment={handleAddComment}
        isSubmitting={isSubmittingComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 12,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  timestamp: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 4,
  },
  actionText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  actionTextLiked: {
    color: '#E91E63',
    fontWeight: '600',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#999',
    marginTop: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#f0f2f5',
    borderRadius: 16,
    padding: 12,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    marginLeft: 12,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  commentInputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 80,
    color: '#333',
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

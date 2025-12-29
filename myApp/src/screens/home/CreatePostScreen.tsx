import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Import auth to get current user
import { useAuth } from '../../store/AuthContext';
// Import posts API
import { postsAPI } from '../../api';

// Common emojis for picker
const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊',
  '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜',
  '🤪', '😝', '🤑', '🤗', '🤭', '🤔', '🤐', '😐', '😑', '😶',
  '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴',
  '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵',
  '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁',
  '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰',
  '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '👍', '👎', '👏', '🙌', '🤝', '👋', '✌️', '🤞', '🤟', '🤙',
  '🔥', '⭐', '✨', '💫', '🎉', '🎊', '💯', '🏆', '🎯', '💪',
];

// Media attachment type
interface MediaAttachment {
  uri: string;
  type: 'image' | 'video';
}

// Location type
interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function CreatePostScreen() {
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const navigation = useNavigation();
  const { user } = useAuth();

  // Handle post submission
  const handlePost = async () => {
    if (!postContent.trim() && media.length === 0) {
      Alert.alert('Error', 'Please write something or add media to post!');
      return;
    }

    setIsPosting(true);

    try {
      // Send post to backend API
      const response = await postsAPI.createPost(
        postContent.trim(),
        media.length > 0 ? media[0].uri : undefined
      );
      
      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }
      
      // Go back to feed after posting
      navigation.goBack();
      
    } catch {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // Handle cancel/close
  const handleClose = () => {
    if (postContent.trim() || media.length > 0) {
      Alert.alert(
        'Discard Post?',
        'You have unsaved changes. Are you sure you want to discard this post?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to add images.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setMedia([...media, { uri: result.assets[0].uri, type: 'image' }]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Pick video from gallery
  const pickVideo = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to add videos.'
        );
        return;
      }

      // Launch video picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        setMedia([...media, { uri: result.assets[0].uri, type: 'video' }]);
      }
    } catch (error) {
      console.error('Video picker error:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  // Get current location
  const getLocation = async () => {
    try {
      setIsLoadingLocation(true);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your location to add location to your post.'
        );
        return;
      }

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Try to get address
      let address = '';
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        if (geocode) {
          const parts = [geocode.city, geocode.region, geocode.country].filter(Boolean);
          address = parts.join(', ');
        }
      } catch {
        // Ignore geocoding errors
      }

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: address || 'Current Location',
      });

      Alert.alert('Location Added', address || 'Location added to your post!');
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Add emoji to post
  const addEmoji = (emoji: string) => {
    setPostContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Remove media attachment
  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  // Remove location
  const removeLocation = () => {
    setLocation(null);
  };

  return (
    <View style={styles.overlay}>
      {/* Tappable overlay background to close */}
      <TouchableOpacity 
        style={styles.overlayBackground} 
        activeOpacity={1} 
        onPress={handleClose}
      />
      
      {/* Modal content */}
      <View style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>New post</Text>
            
            <TouchableOpacity 
              onPress={handlePost}
              disabled={(!postContent.trim() && media.length === 0) || isPosting}
              style={[
                styles.postButton,
                ((!postContent.trim() && media.length === 0) || isPosting) && styles.postButtonDisabled
              ]}
            >
              <Text style={[
                styles.postButtonText,
                ((!postContent.trim() && media.length === 0) || isPosting) && styles.postButtonTextDisabled
              ]}>
                {isPosting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* User avatar and input */}
            <View style={styles.inputSection}>
              <Image 
                source={{ uri: user?.avatar || 'https://i.pravatar.cc/100?img=5' }} 
                style={styles.avatar} 
              />
              <View style={styles.inputContainer}>
                <Text style={styles.userName}>{user?.name || 'You'}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="What's on your mind?"
                  placeholderTextColor="#999"
                  multiline
                  value={postContent}
                  onChangeText={setPostContent}
                />
              </View>
            </View>

            {/* Location Badge */}
            {location && (
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={16} color="#007AFF" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {location.address}
                </Text>
                <TouchableOpacity onPress={removeLocation} style={styles.removeBtn}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            )}

            {/* Media Preview */}
            {media.length > 0 && (
              <View style={styles.mediaPreview}>
                {media.map((item, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                    {item.type === 'video' && (
                      <View style={styles.videoOverlay}>
                        <Ionicons name="play-circle" size={40} color="#fff" />
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.removeMediaBtn}
                      onPress={() => removeMedia(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer Menu Bar */}
          <View style={styles.footerMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={pickImage}>
              <Ionicons name="image-outline" size={26} color="#4CAF50" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={pickVideo}>
              <Ionicons name="videocam-outline" size={26} color="#E91E63" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={getLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <Ionicons name="hourglass-outline" size={26} color="#FF9800" />
              ) : (
                <Ionicons 
                  name={location ? "location" : "location-outline"} 
                  size={26} 
                  color={location ? "#007AFF" : "#FF9800"} 
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => setShowEmojiPicker(true)}
            >
              <Ionicons name="happy-outline" size={26} color="#9C27B0" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <View style={styles.emojiModalOverlay}>
          <TouchableOpacity 
            style={styles.emojiModalBackground}
            onPress={() => setShowEmojiPicker(false)}
          />
          <View style={styles.emojiModalContent}>
            <View style={styles.emojiModalHeader}>
              <Text style={styles.emojiModalTitle}>Choose an emoji</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.emojiGrid}
              contentContainerStyle={styles.emojiGridContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.emojiRow}>
                {EMOJIS.map((emoji, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.emojiButton}
                    onPress={() => addEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Overlay wrapper (full screen)
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  // Semi-transparent background
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // Modal container (white card)
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '90%',
  },
  keyboardView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  postButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#cce4ff',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    flexDirection: 'row',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  inputContainer: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  textInput: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Location badge
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    maxWidth: 200,
  },
  removeBtn: {
    marginLeft: 8,
  },

  // Media preview
  mediaPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
  },

  // Footer Menu Bar
  footerMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 40,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },

  // Emoji Modal
  emojiModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  emojiModalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  emojiModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 350,
    paddingBottom: 30,
  },
  emojiModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emojiModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  emojiGrid: {
    flex: 1,
  },
  emojiGridContent: {
    padding: 12,
    paddingBottom: 20,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emojiButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  emojiText: {
    fontSize: 28,
  },
});

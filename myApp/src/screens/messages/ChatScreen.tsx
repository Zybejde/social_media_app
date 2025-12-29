import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import * as ImagePicker from 'expo-image-picker';

// Import API
import { messagesAPI, Message as ApiMessage } from '../../api';
import { useAuth } from '../../store/AuthContext';

// Message type
interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

// Format time helper
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Convert API message to local format
const convertMessage = (msg: ApiMessage, myUserId: string): Message => ({
  id: msg._id,
  text: msg.content,
  senderId: msg.sender._id === myUserId ? 'me' : 'other',
  timestamp: formatTime(msg.createdAt),
  status: msg.read ? 'read' : 'delivered',
});

// Message bubble component
function MessageBubble({ message }: { message: Message }) {
  const isMe = message.senderId === 'me';

  return (
    <View style={[styles.messageBubbleContainer, isMe && styles.messageBubbleContainerMe]}>
      <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
        <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
          {message.text}
        </Text>
      </View>
      <View style={[styles.messageInfo, isMe && styles.messageInfoMe]}>
        <Text style={styles.messageTime}>{message.timestamp}</Text>
        {isMe && (
          <Ionicons
            name={message.status === 'read' ? 'checkmark-done' : 'checkmark'}
            size={14}
            color={message.status === 'read' ? '#007AFF' : '#999'}
            style={styles.statusIcon}
          />
        )}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { user: currentUser } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);

  // Common emojis
  const emojis = [
    '😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😅',
    '😭', '😤', '🥺', '😴', '🤗', '😇', '🤩', '😋',
    '👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '💪',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💕',
    '🎉', '🎊', '🎁', '🎈', '✨', '🌟', '💫', '⭐',
    '🔥', '💯', '👀', '🙈', '🙉', '🙊', '💬', '💭',
  ];
  
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef<Animated.Value>(new Animated.Value(1)).current;
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get user info from route params
  const chatUser = (route.params as any)?.user || {
    _id: '',
    name: 'Unknown User',
    avatar: 'https://i.pravatar.cc/100?img=1',
  };

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    if (!chatUser._id) return;
    
    try {
      const response = await messagesAPI.getMessages(chatUser._id);
      
      if (response.data?.messages) {
        setMessages(
          response.data.messages.map((msg) => 
            convertMessage(msg, currentUser?.id || '')
          )
        );
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [chatUser._id, currentUser?.id]);

  // Fetch messages on mount
  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [fetchMessages])
  );

  // Pulse animation for recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  // Recording duration timer
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setRecordingDuration(0);
    }
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !chatUser._id) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text: messageText,
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => [...prev, tempMessage]);
    
    Keyboard.dismiss();
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await messagesAPI.sendMessage(chatUser._id, messageText);
      
      if (response.data?.data) {
        // Replace temp message with real one
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? convertMessage(response.data!.data, currentUser?.id || '')
              : msg
          )
        );
      }
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      Alert.alert('Error', 'Failed to send message');
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    
    // Send voice message placeholder
    const voiceText = `🎤 Voice message (${formatDuration(recordingDuration)})`;
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text: voiceText,
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => [...prev, tempMessage]);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // In a real app, you would upload the audio file and send it
    if (chatUser._id) {
      try {
        await messagesAPI.sendMessage(chatUser._id, voiceText, 'audio');
      } catch (error) {
        console.error('Failed to send voice message:', error);
      }
    }
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    Alert.alert('Recording cancelled');
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  // Handle media picker
  const handlePickImage = async () => {
    setShowMediaOptions(false);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Send image message
      sendMediaMessage('📷 Photo', result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    setShowMediaOptions(false);
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      sendMediaMessage('📷 Photo', result.assets[0].uri);
    }
  };

  const handlePickVideo = async () => {
    setShowMediaOptions(false);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      sendMediaMessage('🎬 Video', result.assets[0].uri);
    }
  };

  const sendMediaMessage = async (text: string, mediaUri: string) => {
    if (!chatUser._id) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text: text,
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => [...prev, tempMessage]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // In a real app, you would upload the media file first
      await messagesAPI.sendMessage(chatUser._id, text, 'image');
    } catch (error) {
      console.error('Failed to send media:', error);
    }
  };

  const handleSendDocument = () => {
    setShowMediaOptions(false);
    Alert.alert('Coming Soon', 'Document sharing will be available soon!');
  };

  const handleSendLocation = () => {
    setShowMediaOptions(false);
    Alert.alert('Coming Soon', 'Location sharing will be available soon!');
  };

  const handleCall = () => {
    navigation.navigate('Call', { user: chatUser });
  };

  const handleVideoCall = () => {
    navigation.navigate('VideoCall', { user: chatUser });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.userInfo}>
          <Image source={{ uri: chatUser.avatar }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{chatUser.name}</Text>
            <Text style={styles.userStatus}>Online</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleCall} style={styles.headerButton}>
            <Ionicons name="call" size={22} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleVideoCall} style={styles.headerButton}>
            <Ionicons name="videocam" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        keyboardShouldPersistTaps="handled"
        style={styles.messagesContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Send the first message!</Text>
          </View>
        }
      />

      {/* Recording UI */}
      {isRecording ? (
        <View style={styles.recordingContainer}>
          <TouchableOpacity onPress={handleCancelRecording} style={styles.cancelRecordingButton}>
            <Ionicons name="trash" size={24} color="#E53935" />
          </TouchableOpacity>

          <View style={styles.recordingInfo}>
            <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
            <Text style={styles.recordingText}>Recording...</Text>
          </View>

          <TouchableOpacity onPress={handleStopRecording} style={styles.sendRecordingButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        /* Normal Input Area */
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => setShowMediaOptions(true)}
          >
            <Ionicons name="add-circle" size={28} color="#007AFF" />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Message..."
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
              editable={!isSending}
            />
            <TouchableOpacity 
              style={styles.emojiButton}
              onPress={() => setShowEmojiPicker(true)}
            >
              <Ionicons name="happy-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {newMessage.trim() ? (
            <TouchableOpacity 
              onPress={handleSend} 
              style={styles.sendButton}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleStartRecording}
              onLongPress={handleStartRecording}
              style={styles.micButton}
            >
              <Ionicons name="mic" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={styles.emojiPickerContainer}>
            <View style={styles.emojiPickerHeader}>
              <Text style={styles.emojiPickerTitle}>Emojis</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.emojiGrid}>
              {emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiBtn}
                  onPress={() => {
                    handleEmojiSelect(emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Media Options Modal */}
      <Modal
        visible={showMediaOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMediaOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMediaOptions(false)}
        >
          <View style={styles.mediaOptionsContainer}>
            <View style={styles.mediaOptionsHeader}>
              <Text style={styles.mediaOptionsTitle}>Send Media</Text>
              <TouchableOpacity onPress={() => setShowMediaOptions(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mediaOptionsGrid}>
              <TouchableOpacity style={styles.mediaOption} onPress={handleTakePhoto}>
                <View style={[styles.mediaOptionIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="camera" size={28} color="#1976D2" />
                </View>
                <Text style={styles.mediaOptionLabel}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaOption} onPress={handlePickImage}>
                <View style={[styles.mediaOptionIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="image" size={28} color="#388E3C" />
                </View>
                <Text style={styles.mediaOptionLabel}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaOption} onPress={handlePickVideo}>
                <View style={[styles.mediaOptionIcon, { backgroundColor: '#FCE4EC' }]}>
                  <Ionicons name="videocam" size={28} color="#C2185B" />
                </View>
                <Text style={styles.mediaOptionLabel}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaOption} onPress={handleSendDocument}>
                <View style={[styles.mediaOptionIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="document" size={28} color="#F57C00" />
                </View>
                <Text style={styles.mediaOptionLabel}>Document</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaOption} onPress={handleSendLocation}>
                <View style={[styles.mediaOptionIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Ionicons name="location" size={28} color="#7B1FA2" />
                </View>
                <Text style={styles.mediaOptionLabel}>Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userStatus: {
    fontSize: 13,
    color: '#4CAF50',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 10,
    marginLeft: 4,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubbleContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  messageBubbleContainerMe: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageBubbleOther: {
    backgroundColor: '#f0f2f5',
    borderBottomLeftRadius: 6,
  },
  messageBubbleMe: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1a1a1a',
  },
  messageTextMe: {
    color: '#fff',
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
  },
  messageInfoMe: {
    marginRight: 4,
    marginLeft: 0,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  statusIcon: {
    marginLeft: 4,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  attachButton: {
    padding: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f0f2f5',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingTop: 0,
    paddingBottom: 5,
  },
  emojiButton: {
    padding: 2,
    marginLeft: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  micButton: {
    padding: 6,
    marginLeft: 8,
    marginBottom: 2,
  },

  // Recording styles
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelRecordingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E53935',
    marginRight: 10,
  },
  recordingTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 10,
  },
  recordingText: {
    fontSize: 14,
    color: '#666',
  },
  sendRecordingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  // Emoji Picker
  emojiPickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 350,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    paddingBottom: 30,
  },
  emojiBtn: {
    width: '12.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 28,
  },

  // Media Options
  mediaOptionsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  mediaOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mediaOptionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  mediaOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'flex-start',
  },
  mediaOption: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 20,
  },
  mediaOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaOptionLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
});

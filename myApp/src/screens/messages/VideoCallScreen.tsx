import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [callStatus, setCallStatus] = useState<'calling' | 'ringing' | 'connected'>('calling');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  
  // Animated values
  const pulseAnim = new Animated.Value(1);
  const fadeAnim = new Animated.Value(1);

  // Get user info from route params
  const user = (route.params as any)?.user || {
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/100?img=1',
  };

  // Simulate call connection
  useEffect(() => {
    const ringingTimeout = setTimeout(() => {
      setCallStatus('ringing');
    }, 1000);

    const connectedTimeout = setTimeout(() => {
      setCallStatus('connected');
      // Fade out the avatar when connected
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 3000);

    return () => {
      clearTimeout(ringingTimeout);
      clearTimeout(connectedTimeout);
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Pulsing animation
  useEffect(() => {
    if (callStatus !== 'connected') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    navigation.goBack();
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'calling':
        return 'Calling...';
      case 'ringing':
        return 'Ringing...';
      case 'connected':
        return formatDuration(callDuration);
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Video Area (simulated with gradient) */}
      <View style={styles.mainVideo}>
        {/* Simulated remote video with gradient */}
        <View style={styles.remoteVideoPlaceholder}>
          {callStatus === 'connected' ? (
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.fullScreenAvatar}
              blurRadius={2}
            />
          ) : (
            <View style={styles.callingOverlay}>
              <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <View style={styles.avatarRing} />
              </Animated.View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.callStatus}>{getStatusText()}</Text>
            </View>
          )}
        </View>

        {/* Self Video Preview */}
        <View style={styles.selfVideoContainer}>
          {isCameraOff ? (
            <View style={styles.cameraOffPlaceholder}>
              <Ionicons name="videocam-off" size={24} color="#fff" />
            </View>
          ) : (
            <View style={styles.selfVideoPlaceholder}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/100?img=5' }} 
                style={styles.selfVideo}
              />
            </View>
          )}
        </View>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleEndCall} style={styles.topButton}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          
          {callStatus === 'connected' && (
            <View style={styles.callInfo}>
              <View style={styles.encryptedBadge}>
                <Ionicons name="lock-closed" size={12} color="#4CAF50" />
                <Text style={styles.encryptedText}>End-to-end encrypted</Text>
              </View>
              <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.topButton}
            onPress={() => setIsFrontCamera(!isFrontCamera)}
          >
            <Ionicons name="camera-reverse" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, isCameraOff && styles.controlButtonOff]}
            onPress={() => setIsCameraOff(!isCameraOff)}
          >
            <Ionicons 
              name={isCameraOff ? 'videocam-off' : 'videocam'} 
              size={26} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonOff]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons 
              name={isMuted ? 'mic-off' : 'mic'} 
              size={26} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Ionicons name="call" size={28} color="#fff" style={styles.endCallIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="chatbubble" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="people" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Main Video Area
  mainVideo: {
    flex: 1,
    position: 'relative',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  fullScreenAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  callingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Self Video
  selfVideoContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selfVideoPlaceholder: {
    flex: 1,
    backgroundColor: '#2a2a3e',
  },
  selfVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraOffPlaceholder: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Top Bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callInfo: {
    alignItems: 'center',
  },
  encryptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  encryptedText: {
    fontSize: 11,
    color: '#4CAF50',
    marginLeft: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },

  // Controls
  controlsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonOff: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  endCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallIcon: {
    transform: [{ rotate: '135deg' }],
  },
});


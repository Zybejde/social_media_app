import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function CallScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [callStatus, setCallStatus] = useState<'calling' | 'ringing' | 'connected'>('calling');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  
  // Animated values for the pulsing effect
  const pulseAnim = new Animated.Value(1);

  // Get user info from route params
  const user = (route.params as any)?.user || {
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/100?img=1',
  };

  // Simulate call connection
  useEffect(() => {
    // Simulate ringing after 1 second
    const ringingTimeout = setTimeout(() => {
      setCallStatus('ringing');
    }, 1000);

    // Simulate connection after 3 seconds
    const connectedTimeout = setTimeout(() => {
      setCallStatus('connected');
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

  // Pulsing animation for calling state
  useEffect(() => {
    if (callStatus !== 'connected') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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
      {/* Background gradient effect */}
      <View style={styles.backgroundOverlay} />

      {/* User Info */}
      <View style={styles.userSection}>
        <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          {callStatus !== 'connected' && <View style={styles.avatarRing} />}
        </Animated.View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.callStatus}>{getStatusText()}</Text>
      </View>

      {/* Call Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, isMuted && styles.actionButtonActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons 
              name={isMuted ? 'mic-off' : 'mic'} 
              size={28} 
              color={isMuted ? '#1a1a1a' : '#fff'} 
            />
            <Text style={[styles.actionLabel, isMuted && styles.actionLabelActive]}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, isSpeaker && styles.actionButtonActive]}
            onPress={() => setIsSpeaker(!isSpeaker)}
          >
            <Ionicons 
              name={isSpeaker ? 'volume-high' : 'volume-medium'} 
              size={28} 
              color={isSpeaker ? '#1a1a1a' : '#fff'} 
            />
            <Text style={[styles.actionLabel, isSpeaker && styles.actionLabelActive]}>
              Speaker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="keypad" size={28} color="#fff" />
            <Text style={styles.actionLabel}>Keypad</Text>
          </TouchableOpacity>
        </View>

        {/* End Call Button */}
        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Ionicons name="call" size={32} color="#fff" style={styles.endCallIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a2e',
    opacity: 0.95,
  },

  // User Section
  userSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  userName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Actions
  actionsContainer: {
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 40,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  actionButton: {
    alignItems: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#fff',
  },
  actionLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    position: 'absolute',
    bottom: -24,
  },
  actionLabelActive: {
    color: '#fff',
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  endCallIcon: {
    transform: [{ rotate: '135deg' }],
  },
});


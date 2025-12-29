// ============================================
// STEP 1: IMPORTS
// ============================================
// Ask yourself: "What React Native components do I need?"
// - View = container (like a <div>)
// - Text = text display
// - TextInput = input field for typing
// - FlatList = efficient scrollable list
// - TouchableOpacity = clickable element
// - Image = display images
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ============================================
// STEP 2: DATA
// ============================================
// Ask yourself: "What data will I display?"
// For now, we use fake data. Later this comes from an API.
const USERS_DATA = [
  {
    id: '1',
    name: 'Sarah Johnson',
    username: '@sarahj',
    avatar: 'https://i.pravatar.cc/100?img=1',
    bio: 'Coffee lover ☕ | Developer',
  },
  {
    id: '2',
    name: 'Mike Chen',
    username: '@mikechen',
    avatar: 'https://i.pravatar.cc/100?img=2',
    bio: 'Photography enthusiast 📷',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    username: '@emmaw',
    avatar: 'https://i.pravatar.cc/100?img=3',
    bio: 'Travel | Food | Life',
  },
  {
    id: '4',
    name: 'Alex Rivera',
    username: '@alexr',
    avatar: 'https://i.pravatar.cc/100?img=4',
    bio: 'Building cool stuff 🚀',
  },
  {
    id: '5',
    name: 'Jessica Lee',
    username: '@jesslee',
    avatar: 'https://i.pravatar.cc/100?img=5',
    bio: 'Designer & Artist 🎨',
  },
];

// ============================================
// STEP 3: COMPONENT
// ============================================

// 3a. Small reusable component for each user card
// TIP: If you repeat similar UI, make it a separate component!
function UserCard({ user }: { user: typeof USERS_DATA[0] }) {
  return (
    <TouchableOpacity style={styles.userCard}>
      {/* Left side: Avatar */}
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      
      {/* Middle: User info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userHandle}>{user.username}</Text>
        <Text style={styles.userBio} numberOfLines={1}>{user.bio}</Text>
      </View>
      
      {/* Right side: Follow button */}
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// 3b. Main Screen Component
export default function SearchScreen() {
  // ----------------------------------------
  // STATE - What can change on this screen?
  // ----------------------------------------
  // The search query that user types
  const [searchQuery, setSearchQuery] = useState('');
  
  // ----------------------------------------
  // COMPUTED VALUES - Derived from state
  // ----------------------------------------
  // Filter users based on search query
  // This recalculates every time searchQuery changes
  const filteredUsers = USERS_DATA.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
  });

  // ----------------------------------------
  // JSX - What does the screen look like?
  // ----------------------------------------
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}  // Updates state as user types
          autoCapitalize="none"
          autoCorrect={false}
        />
        {/* Show clear button only when there's text */}
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results List */}
      <FlatList
        data={filteredUsers}  // The filtered array
        renderItem={({ item }) => <UserCard user={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        // What to show when no results
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================
// STEP 4: STYLES
// ============================================
// Ask yourself: "How should each element look?"
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Search bar styles
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
  
  // List styles
  listContent: {
    paddingHorizontal: 16,
  },
  
  // User card styles
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  followButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Empty state styles
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

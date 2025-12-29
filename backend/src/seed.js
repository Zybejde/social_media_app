/**
 * Seed script to populate the database with test users
 * Run with: node src/seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/social_media_app';

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  avatar: String,
  bio: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Test users to create
const testUsers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@test.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/200?img=1',
    bio: '🎨 Designer & Creative\n📍 New York\n✨ Making the world beautiful',
  },
  {
    name: 'Mike Chen',
    email: 'mike@test.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/200?img=2',
    bio: '💻 Full Stack Developer\n🎮 Gamer\n☕ Coffee addict',
  },
  {
    name: 'Emma Wilson',
    email: 'emma@test.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/200?img=3',
    bio: '📚 Book lover\n🌍 Travel enthusiast\n🍕 Foodie',
  },
  {
    name: 'Alex Rivera',
    email: 'alex@test.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/200?img=4',
    bio: '🏋️ Fitness freak\n🎵 Music lover\n🐕 Dog dad',
  },
  {
    name: 'Jessica Lee',
    email: 'jessica@test.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/200?img=5',
    bio: '📱 Tech enthusiast\n🎬 Movie buff\n🌸 Nature lover',
  },
  {
    name: 'David Kim',
    email: 'david@test.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/200?img=6',
    bio: '🚀 Entrepreneur\n📈 Business minded\n✈️ World traveler',
  },
  {
    name: 'Olivia Brown',
    email: 'olivia@test.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/200?img=7',
    bio: '🎤 Singer & Songwriter\n🎹 Piano player\n💫 Dreamer',
  },
  {
    name: 'James Wilson',
    email: 'james@test.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/200?img=8',
    bio: '📷 Photographer\n🏔️ Adventure seeker\n🎨 Art lover',
  },
];

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔄 Creating test users...\n');

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⏭️  User already exists: ${userData.email}`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword,
      });

      await user.save();
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }

    console.log('\n🎉 Database seeding completed!\n');
    console.log('📧 Test accounts (all use password: password123):');
    console.log('─'.repeat(50));
    testUsers.forEach(user => {
      console.log(`   ${user.name.padEnd(20)} → ${user.email}`);
    });
    console.log('─'.repeat(50));
    console.log('\n💡 You can now log in with any of these accounts to test messaging!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();


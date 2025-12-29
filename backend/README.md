# Social Media App Backend

Node.js + Express + MongoDB backend for the React Native social media app.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**
   
   Create a `.env` file in the backend folder:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/social_media_app
   
   # JWT Secret (use a strong random string in production)
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   
   # Server Port
   PORT=5000
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:8081
   ```

3. **Start MongoDB:**
   
   If using local MongoDB:
   ```bash
   mongod
   ```
   
   Or use [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud database.

4. **Run the server:**
   
   Development mode (with hot reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile

### Users
- `GET /api/users` - Get all users (with search)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/:id/follow` - Follow a user
- `POST /api/users/:id/unfollow` - Unfollow a user
- `GET /api/users/:id/followers` - Get user's followers
- `GET /api/users/:id/following` - Get user's following

### Posts
- `GET /api/posts` - Get feed posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/save` - Save/unsave post
- `POST /api/posts/:id/comments` - Add comment
- `GET /api/posts/saved/me` - Get saved posts
- `GET /api/posts/liked/me` - Get liked posts

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages/:userId` - Send message
- `PUT /api/messages/:messageId/read` - Mark message as read

### Health Check
- `GET /api/health` - Check server status

## WebSocket Events

The server uses Socket.io for real-time features:

### Client Events (emit to server)
- `join` - Join user's personal room
- `private_message` - Send private message
- `typing` - Typing indicator

### Server Events (listen from server)
- `new_message` - New message received
- `user_typing` - User is typing
- `new_post` - New post in feed
- `new_follower` - New follower notification
- `post_liked` - Post was liked
- `new_comment` - New comment on post
- `message_read` - Message was read

## Project Structure

```
backend/
├── src/
│   ├── server.js          # Main server file
│   ├── middleware/
│   │   └── auth.js        # Authentication middleware
│   ├── models/
│   │   ├── User.js        # User model
│   │   ├── Post.js        # Post model
│   │   └── Message.js     # Message model
│   └── routes/
│       ├── auth.js        # Auth routes
│       ├── users.js       # Users routes
│       ├── posts.js       # Posts routes
│       └── messages.js    # Messages routes
├── .env                   # Environment variables
├── package.json
└── README.md
```


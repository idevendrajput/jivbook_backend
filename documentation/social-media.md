# 📱 Social Media API Documentation

## Overview

The Social Media API provides complete functionality for a social media platform including posts, comments, likes, follows, and personalized feeds. Built with Instagram-like features for sharing photos, videos, and engaging with other users.

## Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Posts API

### Create Post
**POST** `/posts`

**Description:** Create a new post with media, caption, and tags

**Request Body:**
```json
{
  "caption": "Look at my beautiful Golden Retriever! 🐕 #dog #pet #goldenretriever #love",
  "media": [
    {
      "type": "image",
      "url": "https://example.com/dog.jpg",
      "order": 0
    },
    {
      "type": "video",
      "url": "https://example.com/dog_video.mp4",
      "thumbnail": "https://example.com/thumbnail.jpg",
      "order": 1
    }
  ],
  "tags": ["dog", "pet", "goldenretriever", "love"],
  "location": {
    "name": "Central Park, New York",
    "coordinates": [-73.968285, 40.785091]
  },
  "mentions": ["64abc123def456789"]
}
```

**Success Response (201):**
```json
{
  "_id": "64def789abc123456",
  "user": {
    "_id": "64abc123def456789",
    "username": "john_doe",
    "profileImage": "https://example.com/profile.jpg"
  },
  "caption": "Look at my beautiful Golden Retriever! 🐕 #dog #pet #goldenretriever #love",
  "media": [...],
  "tags": ["dog", "pet", "goldenretriever", "love"],
  "likesCount": 0,
  "commentsCount": 0,
  "createdAt": "2023-07-24T07:30:00.000Z",
  "updatedAt": "2023-07-24T07:30:00.000Z"
}
```

### Get All Posts
**GET** `/posts`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Success Response (200):**
```json
[
  {
    "_id": "64def789abc123456",
    "user": {
      "_id": "64abc123def456789",
      "username": "john_doe",
      "profileImage": "https://example.com/profile.jpg"
    },
    "caption": "Look at my beautiful Golden Retriever!",
    "media": [...],
    "likesCount": 42,
    "commentsCount": 8,
    "isLikedByCurrentUser": false,
    "timeAgo": "2h",
    "createdAt": "2023-07-24T07:30:00.000Z"
  }
]
```

### Get Post by ID
**GET** `/posts/:id`

### Update Post
**PUT** `/posts/:id`

**Request Body:**
```json
{
  "caption": "Updated caption",
  "tags": ["updated", "tags"]
}
```

### Delete Post
**DELETE** `/posts/:id`

### Like/Unlike Post
**POST** `/posts/:id/like`

**Success Response (200):**
```json
{
  "likesCount": 43
}
```

---

## 💬 Comments API

### Create Comment
**POST** `/comments`

**Request Body:**
```json
{
  "post": "64def789abc123456",
  "text": "So adorable! 😍",
  "parentComment": null,
  "mentions": ["64abc123def456789"]
}
```

**Success Response (201):**
```json
{
  "_id": "64fed321cba987654",
  "post": "64def789abc123456",
  "user": {
    "_id": "64abc123def456789",
    "username": "jane_doe",
    "profileImage": "https://example.com/jane.jpg"
  },
  "text": "So adorable! 😍",
  "likesCount": 0,
  "repliesCount": 0,
  "createdAt": "2023-07-24T08:30:00.000Z"
}
```

### Get Comments by Post
**GET** `/comments/post/:postId`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

### Get Replies to Comment
**GET** `/comments/:commentId/replies`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

### Update Comment
**PUT** `/comments/:id`

### Delete Comment
**DELETE** `/comments/:id`

### Like/Unlike Comment
**POST** `/comments/:id/like`

---

## 👥 Follow API

### Follow User
**POST** `/follow/:userId`

**Success Response (201):**
```json
{
  "message": "User followed successfully",
  "status": "accepted"
}
```

**For Private Account (201):**
```json
{
  "message": "Follow request sent",
  "status": "pending"
}
```

### Unfollow User
**DELETE** `/follow/:userId`

**Success Response (200):**
```json
{
  "message": "User unfollowed successfully"
}
```

### Get Followers
**GET** `/follow/:userId/followers`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Success Response (200):**
```json
[
  {
    "_id": "64abc123def456789",
    "username": "jane_doe",
    "name": "Jane Doe",
    "profileImage": "https://example.com/jane.jpg"
  }
]
```

### Get Following
**GET** `/follow/:userId/following`

### Accept Follow Request
**PUT** `/follow/request/:followId/accept`

### Reject Follow Request
**DELETE** `/follow/request/:followId/reject`

### Get Pending Requests
**GET** `/follow/requests/pending`

---

## 📱 Feed API

### Get Personal Feed
**GET** `/feed`

**Description:** Get personalized feed with posts from followed users

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Success Response (200):**
```json
[
  {
    "_id": "64def789abc123456",
    "user": {
      "_id": "64abc123def456789",
      "username": "john_doe",
      "profileImage": "https://example.com/profile.jpg",
      "isVerified": true
    },
    "caption": "Beautiful sunset! 🌅",
    "media": [...],
    "likesCount": 128,
    "commentsCount": 23,
    "isLikedByCurrentUser": true,
    "timeAgo": "3h",
    "tags": ["sunset", "nature"],
    "location": {
      "name": "Malibu Beach"
    }
  }
]
```

### Get Explore Feed
**GET** `/feed/explore`

**Description:** Discover posts from users you don't follow

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

### Get User Posts
**GET** `/feed/user/:userId`

**Description:** Get posts from a specific user (respects privacy settings)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 12)

### Search by Hashtag
**GET** `/feed/hashtag/:hashtag`

**Description:** Get posts containing a specific hashtag

**Example:** `/feed/hashtag/sunset`

### Get Trending Hashtags
**GET** `/feed/trending/hashtags`

**Success Response (200):**
```json
[
  {
    "_id": "sunset",
    "count": 1247
  },
  {
    "_id": "dog",
    "count": 892
  },
  {
    "_id": "nature",
    "count": 651
  }
]
```

---

## 📊 Error Responses

### Common Error Codes

**400 Bad Request:**
```json
{
  "error": "Caption cannot exceed 2000 characters"
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "error": "This account is private"
}
```

**404 Not Found:**
```json
{
  "error": "Post not found"
}
```

---

## 🔧 Common Query Parameters

Most GET endpoints support these parameters:
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (varies by endpoint)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order: 'asc' or 'desc' (default: desc)

---

## 📱 Test Examples

### Create a Post with cURL
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "caption": "My adorable cat! 😻 #cat #cute",
    "media": [
      {
        "type": "image",
        "url": "https://example.com/cat.jpg",
        "order": 0
      }
    ],
    "tags": ["cat", "cute"]
  }'
```

### Like a Post
```bash
curl -X POST http://localhost:5000/api/posts/64def789abc123456/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Follow a User
```bash
curl -X POST http://localhost:5000/api/follow/64abc123def456789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Personal Feed
```bash
curl -X GET "http://localhost:5000/api/feed?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

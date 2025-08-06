# 📱 Social Media API Documentation

## Overview

The Social Media API provides complete functionality for a social media platform including posts, comments, likes, follows, and personalized feeds. Built with Instagram-like features for sharing photos, videos, and engaging with other users.

## Base URL
```
http://localhost:3010/api
```

## 📁 File Upload Support

**Important**: Post media fields now use multipart file uploads instead of URLs.

### Supported Media Types
- **Images**: JPG, JPEG, PNG, GIF, WEBP (max 10MB each)
- **Videos**: MP4, AVI, MOV, MKV (max 100MB each)
- **Multiple Files**: Up to 10 media files per post
- **Storage**: Files stored locally with unique filenames
- **URLs**: Auto-generated as `/uploads/post-{timestamp}-{random}.ext`

## 🔐 Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Posts API

### Create Post
**POST** `/posts`

**Description:** Create a new post with multipart file uploads, caption, and tags
**Content-Type:** `multipart/form-data`
**Authentication:** Required

**Request Body (Form Data):**
```
caption: "Look at my beautiful Golden Retriever! 🐕 #dog #pet #goldenretriever #love"
media: file[] (multiple image/video files, max 10)
locationName: "Central Park, New York" (optional)
latitude: "40.785091" (optional)
longitude: "-73.968285" (optional)
tags: "dog,pet,goldenretriever,love" (comma-separated, without #)
mentions: "64abc123def456789,64def456abc789123" (comma-separated user IDs)
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "_id": "64def789abc123456",
    "user": {
      "_id": "64abc123def456789",
      "username": "john_doe",
      "name": "John Doe",
      "profileImage": "/uploads/profile-1640995200-123456789.jpg"
    },
    "caption": "Look at my beautiful Golden Retriever! 🐕 #dog #pet #goldenretriever #love",
    "media": [
      {
        "type": "image",
        "url": "/uploads/post-1640995200-123456789.jpg",
        "order": 0
      },
      {
        "type": "video",
        "url": "/uploads/post-1640995200-987654321.mp4",
        "order": 1
      }
    ],
    "tags": ["dog", "pet", "goldenretriever", "love"],
    "location": {
      "name": "Central Park, New York",
      "coordinates": [-73.968285, 40.785091]
    },
    "likesCount": 0,
    "commentsCount": 0,
    "isActive": true,
    "createdAt": "2025-01-06T07:30:00.000Z"
  }
}
```

### Get All Posts
**GET** `/posts`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Posts fetched successfully",
  "data": {
    "posts": [
      {
        "_id": "64def789abc123456",
        "user": {
          "_id": "64abc123def456789",
          "username": "john_doe",
          "name": "John Doe",
          "profileImage": "/uploads/profile-1640995200-123456789.jpg"
        },
        "caption": "Look at my beautiful Golden Retriever!",
        "media": [
          {
            "type": "image",
            "url": "/uploads/post-1640995200-123456789.jpg",
            "order": 0
          }
        ],
        "tags": ["dog", "pet"],
        "likesCount": 42,
        "commentsCount": 8,
        "isActive": true,
        "timeAgo": "2h",
        "createdAt": "2025-01-06T07:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPosts": 42,
      "hasMore": true
    }
  }
}
```

### Get Post by ID
**GET** `/posts/:id`

### Update Post
**PUT** `/posts/:id`

**Description:** Update post caption, tags, or location (media cannot be updated)
**Content-Type:** `application/json`
**Authentication:** Required (Owner only)

**Request Body:**
```json
{
  "caption": "Updated caption with new hashtags! #updated",
  "tags": ["updated", "tags"],
  "location": {
    "name": "New Location",
    "coordinates": [-74.006, 40.7128]
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "_id": "64def789abc123456",
    "caption": "Updated caption with new hashtags! #updated",
    "tags": ["updated", "tags"],
    "updatedAt": "2025-01-06T08:30:00.000Z"
  }
}
```

### Delete Post
**DELETE** `/posts/:id`

**Description:** Delete a post and all associated media files
**Authentication:** Required (Owner only)
**File Cleanup:** Automatically deletes all associated media files

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### Like/Unlike Post
**POST** `/posts/:id/like`

**Description:** Toggle like status on a post
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post liked",
  "data": {
    "likesCount": 43,
    "isLiked": true
  }
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
    "profileImage": "/uploads/profiles/profile_2_1704067200000.jpg"
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
    "profileImage": "/uploads/profiles/profile_2_1704067200000.jpg"
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
      "profileImage": "/uploads/profiles/profile_1_1704067200000.jpg",
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

# Jivbook Backend API Documentation

## Base URL
- **Development:** `http://localhost:3010`
- **Production:** `https://api.jivbook.com`

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication APIs

### POST /api/auth
Register or login a user (passwordless authentication)

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string (required)",
  "rememberMe": "boolean (optional, default: true)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered/logged in successfully",
  "data": {
    "token": "JWT access token",
    "refreshToken": "JWT refresh token",
    "user": {
      "_id": "user id",
      "name": "User Name",
      "email": "user@example.com",
      "username": "auto-generated username",
      "isAdmin": false,
      "profileImage": "image url or null",
      "postsCount": 0,
      "followersCount": 0,
      "followingCount": 0
    }
  }
}
```

### POST /api/refresh-token
Refresh access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new access token",
    "refreshToken": "new refresh token"
  }
}
```

---

## 2. Profile APIs

### GET /api/profile
Get current user's profile (requires authentication)

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "user id",
    "name": "User Name",
    "email": "user@example.com",
    "phone": "+1234567890",
    "username": "username",
    "profileImage": "image url or null",
    "bio": "user bio",
    "website": "user website",
    "address": "user address",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "isPrivate": false,
    "isVerified": false,
    "isAdmin": false,
    "postsCount": 0,
    "followersCount": 0,
    "followingCount": 0,
    "petTypePreferences": {
      "dairyPets": false,
      "companionPets": false
    },
    "preferredPetCategories": []
  }
}
```

### PUT /api/profile/image
Upload/Update profile image (requires authentication)

**Request Body (form-data):**
```
profileImage: "file (required)"
```

**Response:**
```json
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "profileImage": "/uploads/profile-1640995200-123456789.jpg"
  }
}
```

### PUT /api/profile
Update current user's profile (requires authentication)

**Request Body (JSON):**
```json
{
  "id": "user id (required)",
  "name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "bio": "string (optional)",
  "website": "string (optional)",
  "address": "string (optional)",
  "latitude": "number (optional)",
  "longitude": "number (optional)",
  "isPrivate": "boolean (optional)"
}
```

---

## 3. Pet Categories APIs

### GET /api/pet-categories
Get all pet categories with pagination

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name or description
- `isActive`: Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Pet categories fetched successfully",
  "data": {
    "categories": [
      {
        "_id": "category id",
        "name": "Dogs",
        "description": "Category description",
        "image": "category image url",
        "icon": "category icon url",
        "slug": "dogs",
        "isActive": true,
        "order": 1,
        "isDairyPet": false,
        "metaTitle": "SEO title",
        "metaDescription": "SEO description",
        "breedCount": 5,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### GET /api/pet-categories/category/:slug
Get pet category by slug

**Response:**
```json
{
  "success": true,
  "message": "Pet category fetched successfully",
  "data": {
    "_id": "category id",
    "name": "Dogs",
    "description": "Category description",
    "image": "category image url",
    "slug": "dogs",
    "breedCount": 5
  }
}
```

### POST /api/pet-categories
Create new pet category (Admin only)

**Request Body (form-data):**
```
name: "string (required)"
description: "string (required)"
image: "file (required)"
icon: "file (required)"
order: "number (optional)"
isDairyPet: "boolean (optional, default: false)"
metaTitle: "string (optional)"
metaDescription: "string (optional)"
```

### PUT /api/pet-categories/:id
Update pet category (Admin only)

**Request Body:** Same as POST

### DELETE /api/pet-categories/:id
Delete pet category (Admin only)

---

## 4. Breeds APIs

### GET /api/breeds
Get all breeds with pagination and filters

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name or description
- `category`: Filter by category ID
- `size`: Filter by size (Small, Medium, Large)
- `isActive`: Filter by active status

**Response:**
```json
{
  "success": true,
  "message": "Breeds fetched successfully",
  "data": {
    "breeds": [
      {
        "_id": "breed id",
        "name": "Labrador Retriever",
        "description": "Breed description",
        "image": "breed image url",
        "icon": "breed icon url",
        "slug": "labrador-retriever",
        "category": {
          "_id": "category id",
          "name": "Dogs",
          "image": "category image url"
        },
        "isActive": true,
        "size": "Large",
        "lifeSpan": "10-12 years",
        "temperament": ["Gentle", "Intelligent", "Friendly"],
        "origin": "Canada",
        "weight": {
          "min": 25,
          "max": 36,
          "unit": "kg"
        },
        "height": {
          "min": 55,
          "max": 62,
          "unit": "cm"
        },
        "exerciseNeeds": "High",
        "groomingNeeds": "Moderate",
        "goodWithKids": true,
        "goodWithPets": true,
        "hypoallergenic": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

### GET /api/breeds/category/:categoryId
Get breeds by category ID

### GET /api/breeds/:slug
Get breed by slug

### POST /api/breeds
Create new breed (Admin only)

**Request Body (form-data):**
```
name: "string (required)"
description: "string (required)"
category: "ObjectId (required)"
image: "file (required)"
icon: "file (required)"
size: "string (Small/Medium/Large)"
lifeSpan: "string"
temperament: "comma-separated string"
origin: "string"
exerciseNeeds: "string"
groomingNeeds: "string"
goodWithKids: "boolean"
goodWithPets: "boolean"
hypoallergenic: "boolean"
```

### PUT /api/breeds/:id
Update breed (Admin only)

### DELETE /api/breeds/:id
Delete breed (Admin only)

---

## 5. Slider APIs

### GET /api/slider/get_all
Get all active sliders (public)

**Response:**
```json
{
  "success": true,
  "message": "Sliders list fetched successfully!",
  "data": [
    {
      "_id": "slider id",
      "imageUrl": "slider image url",
      "redirectionUrl": "https://example.com/page",
      "isActive": true,
      "order": 1,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/slider/admin/get_all
Get all sliders including inactive (Admin only)

### POST /api/slider/add
Add new slider (Admin only)

**Request Body (form-data):**
```
image: "file (required)"
redirectionUrl: "string (required)"
order: "number (optional, default: 0)"
```

### PUT /api/slider/update/:id
Update slider (Admin only)

### DELETE /api/slider/delete_by_id
Delete slider (Admin only)

**Request Body:**
```json
{
  "id": "slider id"
}
```

### PUT /api/slider/toggle/:id
Toggle slider active status (Admin only)

---

## 6. Posts APIs

### GET /api/posts
Get all posts with pagination

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in caption
- `userId`: Filter by user ID
- `tag`: Filter by tag

**Response:**
```json
[
  {
    "_id": "post id",
    "user": {
      "_id": "user id",
      "username": "username",
      "profileImage": "profile image url"
    },
    "caption": "Post caption with #hashtags",
    "media": [
      {
        "type": "image",
        "url": "media url",
        "order": 0,
        "thumbnail": "thumbnail url (for videos)"
      }
    ],
    "location": {
      "name": "Location Name",
      "coordinates": [longitude, latitude]
    },
    "likesCount": 10,
    "commentsCount": 5,
    "isActive": true,
    "tags": ["tag1", "tag2"],
    "mentions": ["userId1", "userId2"],
    "likes": [
      {
        "user": "user id",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/posts/:id
Get post by ID

### POST /api/posts
Create new post (requires authentication)

**Request Body (form-data):**
```
caption: "string (required)"
media: "file[] (required for media posts, max 10 files - images/videos)"
locationName: "string (optional)"
latitude: "number (optional)"
longitude: "number (optional)"
tags: "comma-separated string (optional) - hashtags without #"
mentions: "comma-separated user IDs (optional)"
```

**Response:**
```json
{
  "_id": "post id",
  "user": "user id",
  "caption": "Post caption",
  "media": [
    {
      "type": "image",
      "url": "media file path",
      "order": 0
    }
  ],
  "location": {
    "name": "Location Name",
    "coordinates": [longitude, latitude]
  },
  "tags": ["tag1", "tag2"],
  "likesCount": 0,
  "commentsCount": 0,
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### PUT /api/posts/:id
Update post (requires authentication, owner only)

### DELETE /api/posts/:id
Delete post (requires authentication, owner only)

### POST /api/posts/:id/like
Like or unlike a post (requires authentication)

**Response:**
```json
{
  "likesCount": 11
}
```

---

## 7. Comments APIs

### GET /api/comments/post/:postId
Get comments for a post with pagination

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### GET /api/comments/:commentId/replies
Get replies for a comment

### POST /api/comments
Create new comment (requires authentication)

**Request Body:**
```json
{
  "post": "post id (required)",
  "text": "comment text (required)",
  "parentComment": "parent comment id (optional, for replies)",
  "mentions": ["user id array (optional)"]
}
```

**Response:**
```json
{
  "_id": "comment id",
  "post": "post id",
  "user": {
    "_id": "user id",
    "username": "username",
    "profileImage": "profile image url"
  },
  "text": "Comment text",
  "parentComment": null,
  "likesCount": 0,
  "repliesCount": 0,
  "mentions": [],
  "isActive": true,
  "likes": [],
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### PUT /api/comments/:id
Update comment (requires authentication, owner only)

### DELETE /api/comments/:id
Delete comment (requires authentication, owner only)

### POST /api/comments/:id/like
Like or unlike a comment (requires authentication)

**Response:**
```json
{
  "likesCount": 1
}
```

---

## 8. Follow APIs

### POST /api/follow/:userId
Follow or unfollow a user (requires authentication)

**Response:**
```json
{
  "message": "User followed successfully",
  "status": "accepted"
}
```

### DELETE /api/follow/:userId
Unfollow a user (requires authentication)

### GET /api/follow/:userId/followers
Get user's followers with pagination

### GET /api/follow/:userId/following
Get users that a user follows

### POST /api/follow/request/:followId/accept
Accept follow request (requires authentication)

### POST /api/follow/request/:followId/reject
Reject follow request (requires authentication)

### GET /api/follow/requests/pending
Get pending follow requests (requires authentication)

---

## 9. Feed APIs

### GET /api/feed
Get personalized feed (requires authentication)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
[
  {
    "_id": "post id",
    "user": {
      "_id": "user id",
      "username": "username",
      "profileImage": "profile image url",
      "isVerified": false
    },
    "caption": "Post caption",
    "media": [],
    "location": {},
    "likesCount": 0,
    "commentsCount": 0,
    "tags": [],
    "mentions": [],
    "isActive": true,
    "isLikedByCurrentUser": false,
    "timeAgo": "1m",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/feed/explore
Get explore feed (trending posts)

### GET /api/feed/user/:userId
Get user's posts

### GET /api/feed/hashtag/:hashtag
Get posts by hashtag

### GET /api/feed/trending/hashtags
Get trending hashtags

---

## 10. Pets APIs

### GET /api
Get all pets with advanced filtering and pagination

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in name, description, or location
- `sortBy`: Sort field (default: 'createdAt')
- `sortOrder`: Sort order ('asc' or 'desc', default: 'desc')
- `isActive`: Filter by active status
- `petCategory`: Filter by category ID
- `breed`: Filter by breed ID
- `gender`: Filter by gender ('male', 'female', 'unknown')
- `ageCategory`: Filter by age category
- `owner`: Filter by owner ID
- `isDairyPet`: Filter dairy pets (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Pets fetched successfully",
  "data": {
    "pets": [
      {
        "_id": "pet id",
        "title": "Pet Title",
        "description": "Pet description",
        "petCategory": {
          "_id": "category id",
          "name": "Dogs",
          "image": "category image url"
        },
        "breed": {
          "_id": "breed id",
          "name": "Labrador Retriever"
        },
        "owner": {
          "_id": "owner id",
          "name": "Owner Name",
          "email": "owner@example.com",
          "phone": "+1234567890"
        },
        "price": 5000,
        "age": {
          "value": 2,
          "unit": "years"
        },
        "gender": "male",
        "color": "Golden",
        "weight": {
          "value": 30,
          "unit": "kg"
        },
        "height": {
          "value": 60,
          "unit": "cm"
        },
        "isVaccinated": true,
        "healthStatus": "excellent",
        "images": [
          {
            "url": "/uploads/pet-1640995200-123456789.jpg",
            "filename": "pet-1640995200-123456789.jpg",
            "size": 1024000,
            "isMain": true,
            "uploadedAt": "2025-01-01T00:00:00.000Z"
          }
        ],
        "audio": {
          "url": "/uploads/pet-audio-1640995200-123456789.mp3",
          "filename": "pet-audio-1640995200-123456789.mp3",
          "size": 512000,
          "uploadedAt": "2025-01-01T00:00:00.000Z"
        },
        "address": "Pet Address",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "isAvailable": true,
        "isApproved": false,
        "isPremium": false,
        "viewCount": 10,
        "contactCount": 5,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "slug": "pet-title-timestamp"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### GET /api/pets/:id
Get pet by ID with populated relations

### POST /api/pets
Create new pet (requires authentication)

**Request Body (form-data):**
```
title: "string (required)"
description: "string (required)"
petCategory: "ObjectId (required)"
breed: "ObjectId (optional)"
price: "number (required)"
age[value]: "number (required)"
age[unit]: "string (days/weeks/months/years, required)"
gender: "string (male/female/unknown, required)"
color: "string (optional)"
weight[value]: "number (optional)"
weight[unit]: "string (grams/kg/pounds, optional)"
height[value]: "number (optional)"
height[unit]: "string (cm/inches/feet, optional)"
isVaccinated: "boolean (optional)"
vaccinationDetails: "string (optional)"
healthStatus: "string (excellent/good/fair/needs_attention, optional)"
medicalHistory: "string (optional)"
address: "string (required)"
latitude: "number (required)"
longitude: "number (required)"
images: "file[] (required, multiple images - max 10)"
audio: "file (optional, single audio file)"

// Additional fields for dairy pets:
dairyDetails[milkProduction][value]: "number (optional)"
dairyDetails[milkProduction][unit]: "string (optional)"
dairyDetails[lactationPeriod]: "string (optional)"
dairyDetails[feedingRequirements]: "string (optional)"

// Additional fields for companion pets:
companionDetails[isTrained]: "boolean (optional)"
companionDetails[trainingDetails]: "string (optional)"
companionDetails[temperament]: "string (friendly/aggressive/calm/playful/shy, optional)"
companionDetails[goodWithKids]: "boolean (optional)"
companionDetails[goodWithPets]: "boolean (optional)"
```

### PUT /api/pets/:id
Update pet (requires authentication, owner only)

### DELETE /api/pets/:id
Delete pet (requires authentication, owner only)

### GET /api/pets/nearby
Get nearby pets based on location with intelligent fallback radius expansion

**Query Parameters:**
- `latitude`: User latitude (required)
- `longitude`: User longitude (required)
- `radius`: Search radius in km (default: 10)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `petCategory`: Filter by category
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

**Smart Fallback:** If no pets found within specified radius, automatically expands search to 25km, 50km, 100km, 200km, and finally unlimited range.

**Response:**
```json
{
  "success": true,
  "message": "Nearby pets fetched successfully",
  "data": {
    "pets": [
      {
        "_id": "pet_id",
        "title": "Golden Retriever Puppy",
        "price": 15000,
        "address": "Sector 18, Noida",
        "distanceKm": 2.5,
        "petCategory": {
          "name": "Dogs"
        },
        "owner": {
          "name": "John Doe",
          "phone": "+91-9876543210"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    },
    "searchRadius": "10 km",
    "originalRadius": "10 km",
    "fallbackUsed": false
  }
}
```

### GET /api/pets/recommended
Get recommended pets based on user preferences (requires authentication)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Recommendation Logic:**
- User's preferred pet categories
- Dairy pets preference (if enabled)
- Companion pets preference (if enabled)
- Popular/trending pets (premium, high views, recent)

**Response:**
```json
{
  "success": true,
  "message": "Recommended pets fetched successfully",
  "data": {
    "pets": [...],
    "pagination": {...},
    "recommendationBasis": {
      "userPreferences": true,
      "locationBased": true,
      "dairyPetsPreference": false,
      "companionPetsPreference": true,
      "fallbackUsed": false
    }
  }
}
```

---

## 11. Wishlist APIs

### GET /api/wishlist
Get user's wishlist (requires authentication)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "wishlist": [
    {
      "_id": "wishlist item id",
      "pet": {
        "_id": "pet id",
        "title": "Pet Title",
        "price": 5000,
        "images": [],
        "petCategory": {
          "_id": "category id",
          "name": "Dogs",
          "icon": "category icon url"
        },
        "breed": {
          "_id": "breed id",
          "name": "Labrador Retriever"
        },
        "owner": {
          "_id": "owner id",
          "name": "Owner Name",
          "username": "owner_username"
        }
      },
      "addedAt": "2025-01-01T00:00:00.000Z",
      "timeAgo": "5m ago"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### POST /api/wishlist/:petId
Add pet to wishlist (requires authentication)

**Response:**
```json
{
  "message": "Pet added to wishlist successfully",
  "wishlistItem": {
    "_id": "wishlist item id",
    "petId": "pet id",
    "addedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### DELETE /api/wishlist/:petId
Remove pet from wishlist (requires authentication)

### GET /api/wishlist/status/:petId
Check if pet is in user's wishlist (requires authentication)

**Response:**
```json
{
  "isInWishlist": true,
  "addedAt": "2025-01-01T00:00:00.000Z"
}
```

### GET /api/wishlist/count
Get user's wishlist count (requires authentication)

**Response:**
```json
{
  "count": 5
}
```

---

## 12. Saved Posts APIs

### GET /api/saved-posts
Get user's saved posts (requires authentication)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "savedPosts": [
    {
      "_id": "saved post id",
      "post": {
        "_id": "post id",
        "caption": "Post caption",
        "media": [],
        "likesCount": 10,
        "commentsCount": 5,
        "user": {
          "_id": "user id",
          "name": "User Name",
          "username": "username",
          "profileImage": "profile image url",
          "isVerified": false
        },
        "isLikedByCurrentUser": true,
        "timeAgo": "1d ago"
      },
      "savedAt": "2025-01-01T00:00:00.000Z",
      "savedTimeAgo": "just now"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### POST /api/saved-posts/:postId
Save a post (requires authentication)

**Response:**
```json
{
  "message": "Post saved successfully",
  "savedPost": {
    "_id": "saved post id",
    "postId": "post id",
    "savedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### DELETE /api/saved-posts/:postId
Unsave a post (requires authentication)

### GET /api/saved-posts/filter
Get filtered saved posts

**Query Parameters:**
- `category`: Filter by post category
- `dateRange`: Filter by date range
- `tags`: Filter by tags

### GET /api/saved-posts/status/:postId
Check if post is saved by user (requires authentication)

### GET /api/saved-posts/count
Get user's saved posts count (requires authentication)

---

## 13. Chat & Socket.IO APIs (OLX-Style Real-time Chat)

**Overview**: Complete real-time chat system with Socket.IO integration for pet inquiries and direct messaging.

### Chat Types:
- **Pet Inquiry** (`pet_inquiry`) - Buyer-seller communication for pet listings
- **Direct Chat** (`direct`) - General user-to-user messaging
- **General** (`general`) - Other purposes

### Key Features:
- Real-time messaging with Socket.IO
- File uploads (images/videos up to 50MB)
- Message read receipts and typing indicators
- User online/offline status
- Chat blocking/unblocking
- Unread message counts
- Pagination for chats and messages

### POST /api/chat/create
Create or get existing chat (requires authentication)

**Request Body:**
```json
{
  "participantId": "user id to chat with (required)",
  "petId": "pet id (optional, for pet-related chats)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat created successfully",
  "data": {
    "_id": "chat id",
    "participants": [
      {
        "_id": "user id",
        "name": "User Name",
        "email": "user@example.com",
        "profileImage": "/uploads/profiles/user.jpg"
      }
    ],
    "petListing": {
      "_id": "pet id",
      "title": "Golden Retriever Puppy",
      "images": [
        {
          "url": "/uploads/pets/pet-123.jpg",
          "isMain": true
        }
      ],
      "price": 15000,
      "address": "Delhi, India"
    },
    "chatType": "pet_inquiry",
    "isActive": true,
    "lastMessage": null,
    "unreadCount": [],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### GET /api/chat/my-chats
Get user's chats (requires authentication)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Chats retrieved successfully",
  "data": {
    "chats": [
      {
        "_id": "chat id",
        "participants": [
          {
            "_id": "user id",
            "name": "User Name",
            "email": "user@example.com",
            "profileImage": "profile image url",
            "isOnline": false,
            "lastSeen": "2025-01-01T00:00:00.000Z"
          }
        ],
        "petListing": {},
        "chatType": "direct",
        "lastMessage": {
          "_id": "message id",
          "content": "Last message content",
          "sender": "sender id",
          "messageType": "text",
          "createdAt": "2025-01-01T00:00:00.000Z"
        },
        "lastMessageTime": "2025-01-01T00:00:00.000Z",
        "unreadCount": [
          {
            "userId": "user id",
            "count": 3
          }
        ],
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalChats": 15,
      "hasMore": true
    }
  }
}
```

### GET /api/chat/:chatId/messages
Get chat messages (requires authentication)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "message id",
        "chat": "chat id",
        "sender": {
          "_id": "sender id",
          "name": "Sender Name",
          "profileImage": "profile image url"
        },
        "messageType": "text",
        "content": "Message content",
        "mediaUrl": "chat-1640995200-123456789.jpg",
        "readBy": ["user id"],
        "status": "sent",
        "parentMessage": null,
        "isEdited": false,
        "isDeleted": false,
        "reactions": [],
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalMessages": 150,
      "hasMore": true
    }
  }
}
```

### POST /api/chat/:chatId/send
Send message in chat (requires authentication)

**Request Body:**
```json
{
  "content": "message content (required)",
  "messageType": "text/image/video/audio (default: text)",
  "mediaUrl": "media url (optional)",
  "parentMessageId": "parent message id for replies (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "message id",
    "chat": "chat id",
    "sender": {
      "_id": "sender id",
      "name": "Sender Name",
      "profileImage": "profile image url"
    },
    "messageType": "text",
    "content": "Message content",
    "status": "sent",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### POST /api/chat/:chatId/send-media
Send media message (requires authentication)

**Request Body (form-data):**
```
content: "message caption (optional)"
media: "file (required - image/video only, max 50MB)"
```

**Response:**
```json
{
  "success": true,
  "message": "Media message sent successfully",
  "data": {
    "_id": "message id",
    "chat": "chat id",
    "sender": {
      "_id": "sender id",
      "name": "Sender Name",
      "profileImage": "profile image url"
    },
    "messageType": "image",
    "content": "Sent image",
    "mediaUrl": "chat-1640995200-123456789.jpg",
    "status": "sent",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/chat/:chatId/mark-read
Mark all messages in chat as read (requires authentication)

### DELETE /api/chat/message/:messageId
Delete a message (requires authentication, sender only)

### PUT /api/chat/:chatId/toggle-block
Block or unblock a chat (requires authentication)

---

## 14. Map APIs

### POST /api/map/get-places
Search for places using Google Places API

**Request Body:**
```json
{
  "searchText": "search query (required)",
  "cities": "boolean (optional, filter only cities)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Places fetched successfully",
  "data": {
    "predictions": [
      {
        "description": "Delhi, India",
        "place_id": "ChIJL_P_CXMEDTkRw0ZdG-0GVvw",
        "structured_formatting": {
          "main_text": "Delhi",
          "secondary_text": "India"
        },
        "terms": [
          {
            "offset": 0,
            "value": "Delhi"
          }
        ],
        "types": ["locality", "political"],
        "latitude": 28.6814551,
        "longitude": 77.22279,
        "mapUrl": "https://maps.google.com/?cid=18182728160991069891"
      }
    ],
    "status": "OK"
  }
}
```

---

## 15. Users APIs

### GET /api/users
Get all users (public, for testing purposes)

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "user id",
      "name": "User Name",
      "email": "user@example.com",
      "phone": "+1234567890",
      "username": "username",
      "profileImage": "profile image url",
      "address": "user address",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "bio": "user bio",
      "website": "user website",
      "isPrivate": false,
      "isVerified": false,
      "isAdmin": false,
      "postsCount": 5,
      "followersCount": 100,
      "followingCount": 50,
      "petTypePreferences": {
        "dairyPets": false,
        "companionPets": true
      },
      "preferredPetCategories": [],
      "isOnline": false,
      "lastSeen": "2025-01-01T00:00:00.000Z",
      "createdOn": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 16. Database Seeding APIs

### POST /api/seed/database
Seed database with test data (development only)

**Response:**
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "data": {
    "petCategories": 12,
    "breeds": 3,
    "users": 13,
    "sliders": 5,
    "posts": 6,
    "comments": 12,
    "follows": 25
  }
}
```

### POST /api/seed/clear
Clear all data and indexes (development only)

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description",
  "data": null
}
```

### Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

### Common Error Messages:
- `"Token not provided"`: Authentication required
- `"Invalid token"`: Token expired or malformed
- `"Access denied"`: Insufficient permissions
- `"User not found"`: User doesn't exist
- `"Validation failed"`: Request data validation errors

---

## File Upload Guidelines

### Important Notes:
- **NO URL INPUTS**: All image/video/audio fields now accept only multipart file uploads
- **Files are stored locally**: Files are saved to server filesystem with unique filenames
- **Auto-generated paths**: System automatically generates URLs like `/uploads/filename.ext`
- **File management**: Old files are automatically deleted when updated/removed

### Supported Formats:
- **Images**: JPG, JPEG, PNG, GIF, WEBP
- **Videos**: MP4, AVI, MOV, MKV
- **Audio**: MP3, WAV, AAC, OGG

### Size Limits:
- **Images**: 10MB per file
- **Videos**: 100MB per file  
- **Audio**: 25MB per file
- **Chat Media**: 50MB per file

### Upload Endpoints:
- **Pet Media**: `POST /api/pets` (images + audio)
- **Pet Update**: `PUT /api/pets/:id` (images + audio)
- **Category**: `POST /api/pet-categories` (image + icon)
- **Breed**: `POST /api/breeds` (image + icon)
- **Slider**: `POST /api/slider/add` (image only)
- **Profile Image**: `PUT /api/profile/image` (single image)
- **Post Media**: `POST /api/posts` (multiple images/videos)
- **Chat Media**: `POST /api/chat/:chatId/send-media` (single file)

### File Storage Structure:
```
uploads/
├── pet-{timestamp}-{random}.jpg
├── category-{timestamp}-{random}.png
├── breed-{timestamp}-{random}.jpg
├── slider-{timestamp}-{random}.jpg
├── profile-{timestamp}-{random}.jpg
├── post-{timestamp}-{random}.mp4
├── chat-{timestamp}-{random}.jpg
└── audio-{timestamp}-{random}.mp3
```

---

## WebSocket Events (Chat)

### Connection:
```javascript
const socket = io('http://localhost:3010', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events:

#### Join Chat Room:
```javascript
socket.emit('join-chat', { chatId: 'chat-id' });
```

#### Send Message:
```javascript
socket.emit('send-message', {
  chatId: 'chat-id',
  content: 'message content',
  messageType: 'text'
});
```

#### Receive Message:
```javascript
socket.on('new-message', (message) => {
  console.log('New message:', message);
});
```

#### User Typing:
```javascript
socket.emit('typing', { chatId: 'chat-id', isTyping: true });
socket.on('user-typing', ({ userId, isTyping }) => {
  // Handle typing indicator
});
```

#### User Online Status:
```javascript
socket.on('user-online', ({ userId, isOnline }) => {
  // Handle online status change
});
```

---

## Rate Limiting

### Default Limits:
- **Authentication**: 5 requests per minute
- **File Uploads**: 10 requests per minute
- **General APIs**: 100 requests per minute
- **Chat Messages**: 50 requests per minute

### Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Security Features

### JWT Authentication:
- Access tokens expire in 24 hours
- Refresh tokens expire in 7 days
- Tokens are signed with HS256 algorithm

### Password Security:
- Passwordless authentication system
- OTP-based verification (future implementation)

### Data Validation:
- All inputs are validated and sanitized
- MongoDB injection protection
- XSS protection

### File Upload Security:
- File type validation
- File size limits
- Virus scanning (future implementation)

---

## Environment Variables

```
PORT=3010
MONGO_URI=mongodb://localhost:27017/jivbook
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_API_KEY=your-google-maps-key
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

---

This documentation covers all available APIs in the Jivbook backend. For any issues or feature requests, please contact the development team.

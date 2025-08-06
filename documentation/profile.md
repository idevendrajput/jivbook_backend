# 👤 Profile API Documentation

The Profile API handles comprehensive user profile management including profile information, preferences, location data, pet preferences, and social features for the Jivbook platform.

## Features
- **Profile Retrieval**: Get current user or any user's profile
- **Profile Updates**: Update user information, preferences, and settings
- **Location Management**: Handle user location and address data
- **Pet Preferences**: Manage dairy/companion pet preferences
- **Social Metrics**: Track posts, followers, following counts
- **Privacy Settings**: Control profile visibility
- **Image Upload Support**: Profile picture management

## Base URL
```
/api/profile
```

## Authentication
🔒 **Required**: All profile endpoints require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

---

## Endpoints

### GET /api/profile
Get current user profile (from authentication token).

**Method**: `GET`  
**Authentication**: Required  

#### Success Response (200)
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "user_id",
    "name": "User Name",
    "username": "username",
    "email": "user@example.com",
    "profileImage": "https://example.com/profile.jpg",
    "address": "User Address",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "petTypePreferences": {
      "dairyPets": false,
      "companionPets": true
    },
    "preferredPetCategories": ["category_id_1", "category_id_2"],
    "createdOn": "2024-01-01T00:00:00.000Z",
    "lastUpdate": "2024-01-02T00:00:00.000Z"
  }
}
```

### GET /api/profile/:id
Get user profile by ID.

**Method**: `GET`  
**Authentication**: Required  

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | User ID to retrieve |

#### Success Response (200)
Same format as GET /api/profile

### PUT /api/profile
Update user profile information.

**Method**: `PUT`  
**Authentication**: Required  
**Content-Type**: `application/json`

#### Request Body
```json
{
  "id": "user_id",
  "name": "Updated Name",
  "profileImage": "https://example.com/profile.jpg",
  "address": "New Delhi, India",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "preferencePetType": "Dog",
  "preferenceCategories": "Category1,Category2",
  "fcm": "firebase_cloud_messaging_token"
}
```

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | User ID to update |
| `name` | String | No | Updated user name |
| `profileImage` | String | No | URL to profile image |
| `address` | String | No | User's address |
| `latitude` | Number | No | Geographic latitude |
| `longitude` | Number | No | Geographic longitude |
| `preferencePetType` | String | No | Preferred pet type |
| `preferenceCategories` | String | No | Comma-separated category preferences |
| `fcm` | String | No | FCM token for push notifications |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Updated Name",
      "username": "johndoe1",
      "email": "john@example.com",
      "profileImage": "https://example.com/profile.jpg",
      "address": "New Delhi, India",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "preferencePetType": "Dog",
      "preferenceCategories": "Category1,Category2",
      "fcm": "firebase_cloud_messaging_token",
      "createdOn": "2024-01-01T00:00:00.000Z",
      "lastUpdate": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Access denied",
  "error": "No token provided"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "User not found",
  "error": "No user found with the provided ID"
}
```

**500 Server Error**
```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

## Example Usage

### cURL Example
```bash
curl -X PUT http://localhost:3001/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "id": "USER_ID_HERE",
    "name": "Updated Name",
    "profileImage": "https://example.com/profile.jpg",
    "address": "New Delhi, India",
    "preferencePetType": "Dog"
  }'
```

### JavaScript Example
```javascript
const updateProfile = async (token, profileData) => {
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Profile update failed:', error);
  }
};
```

---

## Notes

- Profile updates are incremental - only provide fields you want to update
- Location data (latitude/longitude) is used for location-based features
- FCM token is used for push notifications
- All string fields are automatically trimmed
- The `lastUpdate` timestamp is automatically updated on profile changes
- Username cannot be changed through this endpoint (generated automatically during registration)

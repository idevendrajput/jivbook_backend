# 👤 Profile API Documentation

The Profile API handles comprehensive user profile management including profile information, preferences, location data, pet preferences, and social features for the Jivbook platform.

## Features
- **Profile Retrieval**: Get current user or any user's profile
- **Profile Updates**: Update user information, preferences, and settings
- **Location Management**: Handle user location and address data
- **Pet Preferences**: Manage dairy/companion pet preferences
- **Social Metrics**: Track posts, followers, following counts
- **Privacy Settings**: Control profile visibility
- **File Upload Support**: Multipart profile image upload (no URLs)

## 📁 Profile Image Upload

**Important**: Profile image field now uses multipart file upload instead of URLs.

### Supported Image Types
- **Formats**: JPG, JPEG, PNG, GIF, WEBP
- **Size Limit**: 10MB per file
- **Storage**: Files stored locally with unique filenames
- **URLs**: Auto-generated as `/uploads/profile-{timestamp}-{random}.ext`

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
    "profileImage": "/uploads/profile-1640995200-123456789.jpg",
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

### PUT /api/profile/image
Upload/Update profile image.

**Method**: `PUT`  
**Authentication**: Required  
**Content-Type**: `multipart/form-data`

#### Request Body (Form Data)
```
profileImage: file (required) - Image file to upload
```

#### Success Response (200)
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
Update user profile information (text data only).

**Method**: `PUT`  
**Authentication**: Required  
**Content-Type**: `application/json`

#### Request Body
```json
{
  "id": "user_id",
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "+1234567890",
  "bio": "Updated bio",
  "website": "https://example.com",
  "address": "New Delhi, India",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "isPrivate": false,
  "petTypePreferences": {
    "dairyPets": true,
    "companionPets": false
  },
  "preferredPetCategories": ["category_id_1"]
}
```

#### Request Parameters
|| Parameter | Type | Required | Description |
||-----------|------|----------|-------------|
|| `id` | String | Yes | User ID to update (must match authenticated user) |
|| `name` | String | No | Updated user name |
|| `email` | String | No | Updated email address |
|| `phone` | String | No | Updated phone number |
|| `bio` | String | No | User bio/description |
|| `website` | String | No | User website URL |
|| `address` | String | No | User's address |
|| `latitude` | Number | No | Geographic latitude |
|| `longitude` | Number | No | Geographic longitude |
|| `isPrivate` | Boolean | No | Profile privacy setting |
|| `petTypePreferences` | Object | No | Dairy and companion pet preferences |
|| `preferredPetCategories` | Array | No | Array of preferred pet category IDs |

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
      "profileImage": "/uploads/profile-1640995200-123456789.jpg",
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

### cURL Examples

#### Upload Profile Image
```bash
curl -X PUT http://localhost:3010/api/profile/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profileImage=@/path/to/your/image.jpg"
```

#### Update Profile Info
```bash
curl -X PUT http://localhost:3010/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "id": "USER_ID_HERE",
    "name": "Updated Name",
    "bio": "Updated bio",
    "address": "New Delhi, India",
    "petTypePreferences": {
      "dairyPets": true,
      "companionPets": false
    }
  }'
```

### JavaScript Examples

#### Upload Profile Image
```javascript
const uploadProfileImage = async (token, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    const response = await fetch('/api/profile/image', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Profile image upload failed:', error);
  }
};
```

#### Update Profile Info
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

- **Separate Endpoints**: Profile image upload and text updates use different endpoints
- **File Management**: Old profile images are automatically deleted when new ones are uploaded
- **Profile Updates**: Text updates are incremental - only provide fields you want to update
- **Location Data**: Latitude/longitude used for location-based pet recommendations
- **Authorization**: Users can only update their own profiles
- **File Security**: Only image files are accepted for profile pictures
- **String Trimming**: All text fields are automatically trimmed
- **Auto Timestamps**: `lastUpdate` timestamp automatically updated on profile changes
- **Username**: Cannot be changed (generated automatically during registration)

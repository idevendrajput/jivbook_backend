# 👥 User Management API Documentation

The User Management API provides endpoints for retrieving user information and managing user data.

## Base URL
```
/api/users
```

## Authentication
🔒 **Required**: All user management endpoints require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

---

## Endpoints

### GET /api/users
Retrieve all users in the system (for testing purposes).

**Method**: `GET`  
**Authentication**: Required  
**Content-Type**: `application/json`

#### Success Response (200)
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "user_id_1",
      "name": "John Doe",
      "username": "johndoe1",
      "email": "john@example.com",
      "phone": "+919876543210",
      "profileImage": "https://example.com/profile1.jpg",
      "address": "New Delhi, India",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "preferencePetType": "Dog",
      "preferenceCategories": "Category1,Category2",
      "fcm": "firebase_token_1",
      "createdOn": "2024-01-01T00:00:00.000Z",
      "lastUpdate": "2024-01-02T00:00:00.000Z"
    },
    {
      "_id": "user_id_2",
      "name": "Jane Smith",
      "username": "janesmith1",
      "email": "jane@example.com",
      "phone": "+919876543211",
      "profileImage": "https://example.com/profile2.jpg",
      "address": "Mumbai, India",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "preferencePetType": "Cat",
      "preferenceCategories": "Category2,Category3",
      "fcm": "firebase_token_2",
      "createdOn": "2024-01-01T00:00:00.000Z",
      "lastUpdate": "2024-01-02T00:00:00.000Z"
    }
  ]
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

**500 Server Error**
```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

## User Model Structure

### User Object Properties
| Property | Type | Description |
|----------|------|-------------|
| `_id` | String | Unique user identifier |
| `name` | String | User's full name |
| `username` | String | Unique username (auto-generated) |
| `email` | String | User's email address (optional) |
| `phone` | String | User's phone number (optional) |
| `profileImage` | String | URL to user's profile image |
| `address` | String | User's address |
| `latitude` | Number | Geographic latitude |
| `longitude` | Number | Geographic longitude |
| `preferencePetType` | String | User's preferred pet type |
| `preferenceCategories` | String | Comma-separated category preferences |
| `fcm` | String | Firebase Cloud Messaging token |
| `createdOn` | Date | Account creation timestamp |
| `lastUpdate` | Date | Last profile update timestamp |

---

## Example Usage

### cURL Example
```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### JavaScript Example
```javascript
const getAllUsers = async (token) => {
  try {
    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};
```

### Python Example
```python
import requests

def get_all_users(token):
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.get('http://localhost:3001/api/users', headers=headers)
    return response.json()
```

---

## Notes

- This endpoint is primarily for testing and administrative purposes
- The `__v` field (Mongoose version key) is excluded from responses
- Users must have a valid JWT token to access this endpoint
- Consider implementing pagination for production use with large user bases
- Sensitive information like passwords are never included in responses
- Both email and phone are optional fields - users need at least one during registration

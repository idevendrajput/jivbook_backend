# Authentication API

This module handles passwordless user authentication, registration, JWT token management, and session handling for the Jivbook platform.

## Features
- **Passwordless Authentication**: Login/Register with name + email OR name + phone
- **Automatic Username Generation**: Creates unique usernames from names
- **JWT Token Management**: Access tokens (24h) and refresh tokens (7 days)
- **User Profile Creation**: Automatic profile setup with default values
- **Duplicate Handling**: Smart detection of existing users
- **Location Defaults**: Sets Delhi coordinates as default location

## Base URL
`/api/auth` and `/api/refresh-token`

## Endpoints

### POST /api/auth
Handles both user registration and login in a single endpoint. Creates new user if doesn't exist, otherwise logs in existing user.

**Authentication Required:** ❌ No

**Request Body Options:**

**With Email:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "rememberMe": true
}
```

**With Phone:**
```json
{
  "name": "Jane Smith",
  "phone": "+919876543210",
  "rememberMe": true
}
```

**With Both (Recommended):**
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "phone": "+1234567890",
  "rememberMe": true
}
```

**Parameters:**
- `name` (string, required): User's full name
- `email` (string, optional): User's email address
- `phone` (string, optional): User's phone number with country code
- `rememberMe` (boolean, optional): Whether to keep user logged in (default: true)

**Note:** At least one of `email` or `phone` is required.

**Success Response (New User - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "6893023c3f6cb78b927178e8",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "username": "johndoe1",
      "profileImage": null,
      "address": null,
      "latitude": 28.7041,
      "longitude": 77.1025,
      "bio": "",
      "website": "",
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
      "preferredPetCategories": [],
      "emailVerified": false,
      "rememberMe": true,
      "fcm": null,
      "isOnline": false,
      "createdOn": "2025-08-06T07:20:28.291Z",
      "lastUpdate": "2025-08-06T07:20:28.295Z",
      "lastSeen": "2025-08-06T07:20:28.291Z"
    }
  }
}
```

**Success Response (Existing User - 200):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "689184f32e52d8218db6e6e6",
      "name": "Admin User",
      "email": "admin@jivbook.com",
      "username": "admin",
      "isAdmin": true,
      "profileImage": "/uploads/profiles/admin_profile_1704067200000.jpg",
      "postsCount": 0,
      "followersCount": 10,
      "followingCount": 4,
      "lastSeen": "2025-08-06T07:20:40.228Z"
    }
  }
}
```

### POST /api/refresh-token
Refresh access token using a valid refresh token. Use this when access token expires.

**Authentication Required:** ❌ No (but requires valid refresh token)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Parameters:**
- `refreshToken` (string, required): Valid JWT refresh token

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Username Generation Logic

The system automatically generates unique usernames from user names:

1. **Base Username**: Converts name to lowercase, removes spaces
   - "John Doe" → "johndoe"
2. **Uniqueness Check**: Adds numbers if username exists
   - "johndoe" → "johndoe1" → "johndoe2" (if needed)
3. **Character Limits**: Ensures username meets platform requirements

## Token Management

### Access Tokens
- **Expiration**: 24 hours
- **Usage**: Include in Authorization header for protected routes
- **Format**: `Authorization: Bearer <access_token>`

### Refresh Tokens
- **Expiration**: 7 days
- **Usage**: Obtain new access tokens when expired
- **Security**: Stored securely, rotated on each refresh

## Error Responses

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Name and at least email or phone are required"
}
```

### Invalid Refresh Token (401)
```json
{
  "success": false,
  "message": "Invalid refresh token",
  "error": "Token is expired or invalid"
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Server error",
  "error": "Database connection failed"
}
```

## Testing Examples

### Register New User
```bash
curl -X POST http://localhost:3010/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "phone": "+1234567890"
  }'
```

### Login Existing User
```bash
curl -X POST http://localhost:3010/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@jivbook.com",
    "phone": "+1 9999999999"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:3010/api/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token_here"
  }'
```

## Security Features

- **JWT Signing**: Tokens signed with HS256 algorithm
- **Environment Secrets**: JWT secrets stored in environment variables
- **Input Validation**: All inputs validated and sanitized
- **Rate Limiting**: 5 requests per minute for auth endpoints
- **XSS Protection**: Prevents cross-site scripting attacks
- **Token Rotation**: Refresh tokens rotated on each use

## Integration Notes

1. **Store Tokens Securely**: Use secure storage for tokens on client side
2. **Handle Expiration**: Implement automatic token refresh logic
3. **Error Handling**: Handle all possible error scenarios
4. **User State**: Maintain user authentication state across app
5. **Logout Logic**: Clear tokens from storage on logout

For complete API testing logs, see [API_TESTING_LOGS.md](./API_TESTING_LOGS.md).

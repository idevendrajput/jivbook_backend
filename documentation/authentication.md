# Authentication API

This module handles user login, registration, and JWT token management.

## Endpoints

### POST /api/auth
- Handle login and registration.
- Require `name` + `email` OR `name` + `phone`.

**Request Body (With Email):**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response (New User - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "username": "johndoe1",
      "email": "john@example.com"
    }
  }
}
```

### POST /api/refresh-token
- Refresh JWT token using the refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

## Error Handling
- Returns error status and message for invalid tokens or missing fields.

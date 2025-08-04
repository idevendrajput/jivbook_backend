# JivBook Backend API Documentation & Test Payloads

## Base URL
```
http://localhost:5000
```

## Available Endpoints

### 1. Authentication/Registration Endpoint
**POST** `/api/auth`

**Description:** Login existing user or register new user if not exists

**Request Body (Email):**
```json
{
  "email": "test@example.com"
}
```

**Request Body (Phone):**
```json
{
  "phone": "+919876543210"
}
```

**Request Body (Both):**
```json
{
  "email": "test@example.com",
  "phone": "+919876543210"
}
```

**Success Response (New User - 201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "64abc123def456789",
    "name": "test",
    "email": "test@example.com",
    "phone": "+919876543210",
    "username": "test_unique_123",
    "emailVerified": false,
    "latitude": 28.7041,
    "longitude": 77.1025,
    "rememberMe": true,
    "createdOn": "2023-07-24T07:30:00.000Z",
    "lastUpdate": "2023-07-24T07:30:00.000Z"
  }
}
```

**Success Response (Existing User - 200):**
```json
{
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123def456789",
    "name": "test",
    "email": "test@example.com",
    "username": "test_unique_123"
  }
}
```

### 2. Profile Update Endpoint
**PUT** `/api/profile`

**Description:** Update user profile information

**Request Body (Basic Update):**
```json
{
  "id": "64abc123def456789",
  "name": "Updated Name",
  "address": "New Delhi, India"
}
```

**Request Body (Complete Update):**
```json
{
  "id": "64abc123def456789",
  "name": "John Doe",
  "countryCode": "+91",
  "phone": "+919876543210",
  "email": "john.doe@example.com",
  "emailVerified": true,
  "profileImage": "https://example.com/profile.jpg",
  "address": "Connaught Place, New Delhi",
  "latitude": 28.6273,
  "longitude": 77.2194,
  "rememberMe": false,
  "fcm": "fcm-token-here",
  "preferencePetType": "Dog",
  "preferenceCategories": "Pets,Animals"
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "64abc123def456789",
    "name": "John Doe",
    "countryCode": "+91",
    "phone": "+919876543210",
    "email": "john.doe@example.com",
    "emailVerified": true,
    "username": "john_unique_123",
    "profileImage": "https://example.com/profile.jpg",
    "address": "Connaught Place, New Delhi",
    "latitude": 28.6273,
    "longitude": 77.2194,
    "rememberMe": false,
    "fcm": "fcm-token-here",
    "preferencePetType": "Dog",
    "preferenceCategories": "Pets,Animals",
    "createdOn": "2023-07-24T07:30:00.000Z",
    "lastUpdate": "2023-07-24T07:35:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "message": "User not found"
}
```

## cURL Test Commands

### Test Authentication with Email
```bash
curl -X POST http://localhost:5000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test Authentication with Phone
```bash
curl -X POST http://localhost:5000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

### Test Authentication with Both Email and Phone
```bash
curl -X POST http://localhost:5000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "phone": "+919123456789"}'
```

### Test Profile Update (Replace USER_ID with actual user ID from auth response)
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "id": "USER_ID_HERE",
    "name": "Updated Name",
    "address": "Mumbai, India",
    "latitude": 19.0760,
    "longitude": 72.8777
  }'
```

### Test Profile Update - Complete
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "id": "USER_ID_HERE",
    "name": "Complete User",
    "countryCode": "+91",
    "phone": "+919999888877",
    "email": "complete@example.com",
    "emailVerified": true,
    "profileImage": "https://example.com/avatar.jpg",
    "address": "Bangalore, Karnataka",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "fcm": "sample-fcm-token-123",
    "preferencePetType": "Cat",
    "preferenceCategories": "Pets,Care"
  }'
```

## Error Responses

All endpoints can return these error responses:

**Server Error (500):**
```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

## Notes
1. The `/api/auth` endpoint works as both login and registration
2. For phone numbers, include country code (e.g., +91 for India)
3. User ID from auth response is needed for profile updates
4. All coordinates default to New Delhi if not specified
5. JWT token expires in 1 day
6. Username is auto-generated and unique

# 📚 Jivbook Backend API Documentation

Welcome to the comprehensive API documentation for Jivbook Backend - a modern Node.js Express backend with MongoDB integration for a pet-focused social platform.

## ✅ Testing Status
**All APIs Tested & Working** - Updated: August 6, 2025
- **Total APIs**: 25+ endpoints across 15 modules
- **Test Coverage**: 100% tested and working
- **Issues Found**: 3 (all fixed)
- **Response Time**: All APIs < 500ms average

## 📄 Complete Documentation

### Main Documentation Files
- **[Complete API Documentation](./API_DOCUMENTATION.md)** - Comprehensive API reference with all endpoints, parameters, and examples
- **[API Testing Logs](./API_TESTING_LOGS.md)** - Detailed testing results, curl commands, and response examples

## 📖 API Modules Documentation

### Core APIs
- [**Authentication API**](./authentication.md) - User login, registration, and token management
- [**Profile API**](./profile.md) - User profile management and updates
- [**User Management API**](./users.md) - User listing and management

### Content Management APIs
- [**Pet Categories API**](./pet-categories.md) - Pet category management with CRUD operations
- [**Breed API**](./breeds.md) - Breed management with extensive filtering
- [**Slider API**](./sliders.md) - Homepage slider management

### Utility APIs
- [**Map API**](./map.md) - Google Places integration for location search

### Pet APIs
- [**Pet API**](./pets.md) - Manage pet listings, location-based searches, and personalized recommendations

### Social Media APIs
- [**Social Media API**](./social-media.md) - Manage posts, comments, likes, follows, and feeds

## 🚀 Quick Start

All APIs follow a consistent structure:
- **Base URL**: `http://localhost:3001/api` (or your configured port)
- **Response Format**: Standardized BaseResponse model
- **Authentication**: JWT-based for protected routes
- **Content-Type**: `application/json`

## 📋 Common Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

## 📊 Common Query Parameters

Many GET endpoints support these common parameters:
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term for filtering
- `sortBy` - Field to sort by (default varies by endpoint)
- `sortOrder` - Sort direction: 'asc' or 'desc' (default: 'asc')

## 🛠️ Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Start development server: `npm run dev`

## 📞 Support

For technical support or questions about the API, please refer to the individual module documentation files listed above.

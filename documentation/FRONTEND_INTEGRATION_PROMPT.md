# 🚀 Frontend AI Agent Integration Prompt

## Project Context
You are working on **Jivbook Frontend** - a pet-focused social platform built with React/Next.js that needs to integrate with a comprehensive backend API.

## Backend API Details
- **Base URL**: `https://api.jivbook.com` (Production) or `http://localhost:3010` (Development)
- **API Status**: ✅ **100% Tested & Working** (All 25+ endpoints across 15 modules)
- **Authentication**: JWT-based (Access tokens: 24h, Refresh tokens: 7 days)
- **Response Format**: Consistent JSON structure with success/error handling

## 📚 Complete Documentation Available

### Main Documentation Files
1. **[Complete API Documentation](/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/API_DOCUMENTATION.md)**
   - 📋 **500+ lines** of comprehensive API reference
   - 🔗 All 25+ endpoints with detailed parameters
   - 📝 Request/Response schemas for every API
   - 🧪 Real examples with actual data
   - 🔐 Authentication and security details

2. **[API Testing Logs](/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/API_TESTING_LOGS.md)**
   - 🧪 **Complete testing results** with actual curl commands
   - ✅ All APIs tested and working (3 issues found and fixed)
   - 📊 Real request/response examples you can copy-paste
   - 🔧 Troubleshooting guide for common issues

3. **[Documentation Index](/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/README.md)**
   - 📑 Overview of all available modules
   - 🎯 Quick links to specific API documentation
   - 📈 Testing status and coverage information

## 🔑 Key API Categories You Need to Integrate

### 1. 🔐 Authentication APIs
- **File**: `/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/authentication.md`
- **Key Features**: Passwordless login (name + email/phone), JWT tokens, auto username generation
- **Main Endpoints**: 
  - `POST /api/auth` - Login/Register
  - `POST /api/refresh-token` - Token refresh

### 2. 👤 Profile Management
- **File**: `/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/profile.md`
- **Key Features**: User profiles, preferences, location, social metrics
- **Main Endpoints**:
  - `GET /api/profile` - Get current user profile
  - `PUT /api/profile` - Update profile

### 3. 🐾 Pet Management System
- **Pet Categories**: `/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/pet-categories.md`
- **Breeds**: `/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/breeds.md`
- **Pets**: `/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/pets.md`
- **Features**: Complete CRUD, image uploads, filtering, admin controls

### 4. 📱 Social Media Features
- **File**: `/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/social-media.md`
- **Features**: Posts, comments, likes, follows, feeds, media uploads
- **Key Endpoints**:
  - `GET /api/posts` - Get posts feed
  - `POST /api/posts` - Create post with media
  - `POST /api/posts/:id/like` - Like/unlike posts
  - `POST /api/comments` - Add comments
  - `POST /api/follow/:userId` - Follow users

### 5. 💬 Real-time Chat
- **Features**: Direct messages, pet inquiries, WebSocket support
- **Endpoints**: Chat creation, message sending, media sharing

### 6. 📊 Content Management
- **Sliders**: `/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/sliders.md`
- **Map Integration**: `/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/map.md`

## 🔧 Frontend Integration Requirements

### Authentication Flow
```javascript
// 1. Login/Register
const authResponse = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "User Name",
    email: "user@example.com",
    phone: "+1234567890"
  })
});

// 2. Store tokens securely
const { token, refreshToken, user } = authResponse.data;
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);

// 3. Use in subsequent requests
const apiCall = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### File Upload Example
```javascript
// For posts with media
const formData = new FormData();
formData.append('caption', 'My pet post!');
formData.append('media', fileInput.files[0]);
formData.append('location', 'Delhi, India');
formData.append('tags', 'cute,pet,dog');

const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Error Handling
```javascript
const handleApiResponse = async (response) => {
  const data = await response.json();
  
  if (data.success) {
    return data.data; // Success data
  } else {
    throw new Error(data.message || 'API Error');
  }
};
```

## 📋 Standard Response Format
All APIs return consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* Response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical details",
  "data": null
}
```

## 🎯 Frontend Pages You Need to Build

### Core Pages
1. **Login/Register** - Use authentication API
2. **User Dashboard** - Profile + posts feed
3. **Pet Listings** - Browse pets with filters
4. **Pet Details** - Individual pet pages with contact
5. **User Profiles** - Social profiles with posts/followers
6. **Chat Interface** - Real-time messaging
7. **Post Creation** - Media upload with location
8. **Admin Panel** - Category/breed management (admin users only)

### Key Features to Implement
- 🔐 **JWT Authentication** with auto-refresh
- 📱 **Responsive Design** for mobile/desktop
- 🖼️ **Image/Video Upload** with preview
- 🗺️ **Location Services** (Google Places integration)
- 💬 **Real-time Chat** (WebSocket)
- 📊 **Infinite Scroll** for feeds
- ❤️ **Like/Unlike** functionality
- 👥 **Follow/Unfollow** system
- 🔍 **Search & Filters** for pets
- 📈 **Admin Dashboard** (for admin users)

## 🔒 Security Considerations
- Store JWT tokens securely (httpOnly cookies recommended)
- Implement automatic token refresh
- Handle 401/403 errors gracefully
- Validate file uploads on frontend
- Sanitize user inputs
- Use HTTPS in production

## 📚 How to Use This Information

1. **Start with**: Read the main API documentation file first
2. **Authentication**: Implement login/register flow using authentication.md
3. **Core Features**: Build pet browsing using pet-categories.md and pets.md
4. **Social Features**: Add posts/comments using social-media.md
5. **Testing**: Use API_TESTING_LOGS.md for real examples and troubleshooting

## 🚨 Important Notes

- **All APIs are tested and working** - you can rely on them
- **File uploads require multipart/form-data** - not JSON
- **Admin features require admin tokens** - check user.isAdmin
- **WebSocket available** for real-time chat features
- **Rate limiting in place** - handle 429 errors
- **Pagination available** on all list endpoints

## 📞 Backend Team Contact
- All documentation is up-to-date as of August 6, 2025
- 100% test coverage with detailed examples
- 3 issues were found and fixed during testing
- Response times are under 500ms average

**Recommendation**: Start by reading the Complete API Documentation file, then implement authentication, then build core pet browsing functionality, and finally add social features.

---

**Documentation Location**: `/Users/devendrasingh/WebstormProjects/jivbook_backend/documentation/`
**Last Updated**: August 6, 2025
**API Status**: ✅ Production Ready

# 🐾 Jivbook Backend

A modern Node.js Express backend with MongoDB for user authentication and profile management. Built with a modular architecture featuring centralized endpoints, route separation, and comprehensive API management for a pet-focused social platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your configuration:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here_make_it_strong
PORT=5000
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

4. Start the production server:
```bash
npm start
```

The server will run on `http://localhost:5000` (or your configured PORT)

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv
- **Development**: nodemon
- **CORS**: CORS middleware enabled

## Database Setup

### Seed Data

To populate the database with sample slider data:

```bash
# Using npm script
npm run seed:sliders

# Or directly
node seeds/sliderSeeds.js
```

This will create 5 sample sliders with pet-related images.

## API Endpoints

### Pet Categories API
Manage different categories of pets and their characteristics.

**Base URL:** `/api/pet-categories`

- **GET** `/` - Retrieve all pet categories with optional filters, search, sorting, and pagination.
- **GET** `/:slug` - Retrieve a single pet category by its slug.
- **POST** `/` - Add a new pet category. (Admin only)
- **PUT** `/:id` - Update a pet category by ID. (Admin only)
- **DELETE** `/:id` - Delete a pet category by ID. (Admin only)

**Filters:**
- `isActive`
- `search` (by name or description)

### Breeds API
Manage different breeds under each pet category, providing extensive filters and features.

**Base URL:** `/api/breeds`

- **GET** `/` - Retrieve all breeds with filters, search, sorting, and pagination.
- **GET** `/:slug` - Retrieve a breed by its slug.
- **POST** `/` - Add a new breed. (Admin only)
- **PUT** `/:id` - Update a breed by ID. (Admin only)
- **DELETE** `/:id` - Delete a breed by ID. (Admin only)

**Filters:**
- `category`
- `size`, `exerciseNeeds`, `groomingNeeds`
- Boolean flags like `goodWithKids`, `goodWithPets`, `hypoallergenic`
- `search` (by breed name or description)

Pagination and sorting parameters are available for both APIs. Ensure proper admin authentication for restricted routes.

### Map API
Google Places API integration for location search and place details.

**Base URL:** `/api/map`

- **POST** `/get-places` - Search places using Google Places API with text input.

**Request Body:**
```json
{
  "searchText": "Restaurant near me",
  "cities": false
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
        "description": "Restaurant Name, Address",
        "place_id": "ChIJ...",
        "latitude": 28.7041,
        "longitude": 77.1025,
        "mapUrl": "https://maps.google.com/..."
      }
    ],
    "status": "OK"
  }
}
```

### 1. Authentication (Login/Register)
**POST** `/api/auth`

Handles both login and registration in a single endpoint. Requires **name** + **email** OR **name** + **phone**. If user doesn't exist, it creates a new user.

**Request Body (With Email):**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Request Body (With Phone):**
```json
{
  "name": "John Doe",
  "phone": "+919876543210"
}
```

**Request Body (With Both):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210"
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
      "email": "john@example.com",
      "phone": "+919876543210",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "createdOn": "2024-01-01T00:00:00.000Z",
      "lastUpdate": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Response (Existing User - 200):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "username": "johndoe1",
      "email": "john@example.com"
      // ... other user fields
    }
  }
}
```

### 2. Update Profile
**PUT** `/api/profile`

Updates user profile information.

**Request Body:**
```json
{
  "id": "user_id",
  "name": "Updated Name",
  "profileImage": "image_url",
  "address": "New Address",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "preferencePetType": "Dog",
  "preferenceCategories": "Category1,Category2",
  "fcm": "fcm_token"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    // Updated user object
  }
}
```

### 3. Slider API

The slider API manages image sliders for the application home screen.

**GET** `/api/slider/get_all` - Get all active sliders
**POST** `/api/slider/add` - Add new slider
**PUT** `/api/slider/update/:id` - Update slider by ID
**DELETE** `/api/slider/delete_by_id?id=SLIDER_ID` - Delete slider by ID
**PATCH** `/api/slider/toggle/:id` - Toggle slider active status

For detailed API documentation for all modules, see the [documentation folder](./documentation/README.md)

## 🧪 API Testing

### Quick Test Commands

#### 1. Test Authentication with Email
```bash
curl -X POST http://localhost:5000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

#### 2. Test Authentication with Phone
```bash
curl -X POST http://localhost:5000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "phone": "+919876543210"
  }'
```

#### 3. Test Profile Update (Replace USER_ID and TOKEN)
```bash
curl -X PUT http://localhost:5000/api/profile \
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

#### 4. Get All Sliders
```bash
curl -X GET http://localhost:5000/api/slider/get_all
```

#### 5. Get All Pet Categories
```bash
curl -X GET "http://localhost:5000/api/pet-categories?page=1&limit=10&isActive=true"
```

#### 6. Get Pet Category by Slug
```bash
curl -X GET http://localhost:5000/api/pet-categories/dogs
```

#### 7. Get All Breeds with Filters
```bash
curl -X GET "http://localhost:5000/api/breeds?category=CATEGORY_ID&size=Medium&goodWithKids=true&page=1&limit=10"
```

#### 8. Get Breed by Slug
```bash
curl -X GET http://localhost:5000/api/breeds/golden-retriever
```

#### 9. Add New Pet Category (Admin Only)
```bash
curl -X POST http://localhost:5000/api/pet-categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Dogs",
    "description": "Loyal and friendly companions",
    "image": "https://example.com/dog-category.jpg",
    "icon": "https://example.com/dog-icon.png"
  }'
```

#### 10. Add New Breed (Admin Only)
```bash
curl -X POST http://localhost:5000/api/breeds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Golden Retriever",
    "description": "Friendly and intelligent breed",
    "category": "CATEGORY_ID_HERE",
    "image": "https://example.com/golden-retriever.jpg",
    "characteristics": {
      "size": "Large",
      "lifespan": "10-12 years",
      "temperament": "Friendly, Intelligent, Devoted",
      "origin": "Scotland",
      "exerciseNeeds": "High",
      "groomingNeeds": "Moderate"
    },
    "traits": {
      "goodWithKids": true,
      "goodWithPets": true,
      "hypoallergenic": false
    }
  }'
```

### Response Format
All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Project Architecture

### Modular Structure
```
jivbook_backend/
├── config/          # Database configuration
├── middleware/      # Authentication middleware
├── models/          # Mongoose schemas and response models
├── routes/          # Express route handlers
│   ├── auth.js      # Authentication routes
│   ├── profile.js   # Profile management routes
│   └── slider.js    # Slider management routes
├── utils/           # Utility functions
├── seeds/           # Database seeding scripts
├── docs/            # API documentation
├── endpoints.js     # Centralized endpoint definitions
└── index.js         # Main application entry point
```

### Centralized Endpoints
All API endpoints are defined in `endpoints.js` for consistency and maintainability:

```javascript
const endpoints = require('./endpoints');

// Usage in routes
app.use(endpoints.AUTH, authRoutes);
app.use(endpoints.PROFILE, profileRoutes);
app.use(endpoints.SLIDER_BASE, sliderRoutes);
```

## Features

- **Modular Architecture**: Clean separation of concerns with dedicated route files
- **Centralized Endpoints**: All API endpoints defined in one place
- **Smart Authentication**: Name + Email/Phone based authentication system
- **Auto Username Generation**: Creates unique usernames from names
- **Null Value Handling**: Proper handling of undefined/null values in database
- **JWT Authentication**: Token-based authentication with refresh tokens
- **Profile Management**: Complete profile update system with validation
- **Slider Management**: Complete CRUD operations for image sliders
- **Seed Data Support**: Easy database population with sample data
- **Input Validation**: Proper data cleaning and validation

## Environment Variables

Create a `.env` file with:
```
MONGODB_URI=mongodb+srv://idevendrajput:Devendra1123@test.guy5cjc.mongodb.net/?retryWrites=true&w=majority&appName=Test
JWT_SECRET=your_jwt_secret_key_here_make_it_strong
PORT=5000
NODE_ENV=development
```

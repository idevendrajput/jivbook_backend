# 🐾 Pet API

API documentation for managing and accessing pet data, location-based searches, and personalized recommendations in the Jivbook platform.

## 📁 File Upload Support

**Important**: All pet media fields now use multipart file uploads instead of URLs.

### Supported Media Types
- **Images**: JPG, JPEG, PNG, GIF, WEBP (max 10MB each, up to 10 files)
- **Audio**: MP3, WAV, AAC, OGG (max 25MB, single file)
- **Storage**: Files stored locally with unique filenames
- **URLs**: Auto-generated as `/uploads/filename.ext`

## Endpoints

### Get All Pets
- **URL**: `/api/pets`
- **Method**: `GET`
- **Description**: Retrieve a list of all pets with optional filters and pagination.
- **Parameters**:
  - `page`: (optional) Page number for pagination.
  - `limit`: (optional) Number of items per page.
  - `search`: (optional) Search term for filtering by pet name, description, or location.
  - `sortBy`: (optional) Field to sort by, default is `createdAt`.
  - `sortOrder`: (optional) Sort direction, default is `desc`.
  - `isActive`: (optional) Filter by active status.
  - `petCategory`, `breed`, `gender`, `ageCategory`, `owner`, `isDairyPet`: Additional filters.
- **Response Format**: Success and error responses follow the standard format. Includes pagination details.

### Create a Pet
- **URL**: `/api/pets`
- **Method**: `POST`
- **Authentication**: Required (JWT token)
- **Description**: Add a new pet to the marketplace with multipart file uploads.
- **Content-Type**: `multipart/form-data`
- **Request Body**: Form-data with pet details and files
  ```
  title: string (required)
  description: string (required)
  petCategory: ObjectId (required)
  breed: ObjectId (optional)
  price: number (required)
  age[value]: number (required)
  age[unit]: string (days/weeks/months/years)
  gender: string (male/female/unknown)
  address: string (required)
  latitude: number (required)
  longitude: number (required)
  images: file[] (required, multiple image files)
  audio: file (optional, single audio file)
  
  // Optional fields for dairy pets:
  dairyDetails[milkProduction][value]: number
  dairyDetails[milkProduction][unit]: string
  
  // Optional fields for companion pets:
  companionDetails[isTrained]: boolean
  companionDetails[temperament]: string
  companionDetails[goodWithKids]: boolean
  ```
- **Response Format**: Returns the newly created pet's details with file URLs.

### Get Pet by ID
- **URL**: `/api/pets/:id`
- **Method**: `GET`
- **Description**: Get detailed information for a specific pet by ID.
- **Response Format**: Returns pet details or error if not found.

### Update a Pet (Owner or Admin only)
- **URL**: `/api/pets/:id`
- **Method**: `PUT`
- **Authentication**: Required (Pet owner or Admin)
- **Description**: Update details for a specific pet with optional file uploads.
- **Content-Type**: `multipart/form-data`
- **Request Body**: Form-data with updated fields and optional new files
  ```
  // Any field from create pet can be updated
  title: string (optional)
  description: string (optional)
  price: number (optional)
  images: file[] (optional, replaces all existing images)
  audio: file (optional, replaces existing audio)
  ```
- **File Management**: Old files automatically deleted when replaced
- **Response Format**: Returns updated pet details with new file URLs.

### Delete a Pet (Owner or Admin only)
- **URL**: `/api/pets/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Pet owner or Admin)
- **Description**: Delete a specific pet and all associated files.
- **File Cleanup**: Automatically deletes all associated image and audio files
- **Response Format**: Success or error message.

### Get Nearby Pets
- **URL**: `/api/pets/nearby`
- **Method**: `GET`
- **Description**: Find pets near a specific location using latitude and longitude with intelligent fallback radius expansion.
- **Parameters**:
  - `latitude` & `longitude`: Required user location.
  - `radius`: Optional search radius in kilometers (default 10).
  - `page`: Page number for pagination (default 1).
  - `limit`: Items per page (default 10).
  - Additional filters: `petCategory`, `minPrice`, `maxPrice`.
- **Smart Fallback**: If no pets found within specified radius, automatically expands search to 25km, 50km, 100km, 200km, and finally unlimited range.
- **Response Format**: Returns nearby pets with distance in kilometers, includes fallback information.

### Get Recommended Pets
- **URL**: `/api/pets/recommended`
- **Method**: `GET`
- **Authentication**: Required (JWT token)
- **Description**: Fetch recommended pets based on user preferences, behavior, and location with intelligent fallback.
- **Parameters**: 
  - `page`: Page number for pagination (default 1).
  - `limit`: Items per page (default 10).
- **Recommendation Logic**: 
  - User's preferred pet categories
  - Dairy pets preference (if enabled)
  - Companion pets preference (if enabled)
  - Popular/trending pets (premium, high views, recent)
- **Smart Fallback**: If no pets match user preferences, shows all available pets.
- **Response Format**: Returns recommended pets with recommendation basis details.

## Example API Responses

### Nearby Pets Response
```json
{
  "success": true,
  "message": "Nearby pets fetched successfully",
  "data": {
    "pets": [
      {
        "_id": "pet_id_1",
        "title": "Golden Retriever Puppy",
        "description": "Friendly and well-trained puppy",
        "price": 15000,
        "address": "Sector 18, Noida, UP",
        "distanceKm": 2.5,
        "petCategory": {
          "_id": "category_id",
          "name": "Dogs"
        },
        "owner": {
          "_id": "owner_id",
          "name": "John Doe",
          "phone": "+91-9876543210"
        },
        "images": [
          {
            "url": "/uploads/pets/pet-1640995200-123456789.jpg",
            "isMain": true
          }
        ]
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

### Recommended Pets Response
```json
{
  "success": true,
  "message": "Recommended pets fetched successfully",
  "data": {
    "pets": [
      {
        "_id": "pet_id_2",
        "title": "Persian Cat",
        "description": "Beautiful Persian cat, well-groomed",
        "price": 8000,
        "isPremium": true,
        "viewCount": 25,
        "petCategory": {
          "_id": "cat_category_id",
          "name": "Cats"
        },
        "companionDetails": {
          "goodWithKids": true,
          "temperament": "friendly"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10
    },
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

## Example Response Format

### Pet Data Structure
```json
{
  "success": true,
  "message": "Pet created successfully",
  "data": {
    "_id": "pet_id",
    "title": "Golden Retriever Puppy",
    "description": "Friendly and trained puppy",
    "price": 15000,
    "images": [
      {
        "url": "/uploads/pet-1640995200-123456789.jpg",
        "filename": "pet-1640995200-123456789.jpg",
        "size": 2048000,
        "isMain": true,
        "uploadedAt": "2025-01-06T00:00:00.000Z"
      }
    ],
    "audio": {
      "url": "/uploads/audio-1640995200-987654321.mp3",
      "filename": "audio-1640995200-987654321.mp3",
      "size": 1024000,
      "uploadedAt": "2025-01-06T00:00:00.000Z"
    },
    "owner": {
      "_id": "owner_id",
      "name": "Pet Owner",
      "email": "owner@example.com"
    },
    "petCategory": {
      "_id": "category_id",
      "name": "Dogs"
    },
    "createdAt": "2025-01-06T00:00:00.000Z"
  }
}
```

## Common Behavior
- **Authentication**: Pet creation, update, and deletion require JWT token
- **File Management**: Automatic cleanup of old files on update/delete
- **Filtering & Pagination**: Standardized approach across endpoints
- **Data Response**: Consistent BaseResponse format for success and error handling
- **Authorization**: Only pet owners and admins can modify pet data

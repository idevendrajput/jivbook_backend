# Breeds API Documentation

The Breeds API offers endpoints to manage different breeds under each pet category, allowing extensive filtering and search operations.

## Base URL
```
/api/breeds
```

## Authentication
🔒 **Note**: Admin authentication is required for creating, updating, and deleting breeds.

Include the token in the Authorization header:
```
Authorization: Bearer your_admin_jwt_token_here
```

---

## Endpoints

### GET /
Retrieve all breeds with optional filters, search, sorting, and pagination.

**Method**: `GET`  
**Authentication**: Not required for retrieval

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | Number | No | Page number for pagination |
| `limit` | Number | No | Number of items per page |
| `search` | String | No | Search term for filtering by name or description |
| `category` | String | No | Filter by category ID |
| `size` | String | No | Filter by breed size |
| `exerciseNeeds` | String | No | Filter by exercise needs |
| `groomingNeeds` | String | No | Filter by grooming needs |
| `goodWithKids` | Boolean | No | Filter by compatibility with kids |
| `goodWithPets` | Boolean | No | Filter by compatibility with other pets |
| `hypoallergenic` | Boolean | No | Filter by hypoallergenic trait |
| `sortBy` | String | No | Field to sort by (default: `order`) |
| `sortOrder` | String | No | Sort order, `asc` or `desc` (default: `asc`) |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Breeds fetched successfully",
  "data": {
    "breeds": [
      {
        "_id": "breed_id",
        "name": "Golden Retriever",
        "description": "Friendly and intelligent breed",
        "image": "/uploads/breeds/breed_1_1704067200000.jpg",
        "icon": "/uploads/breeds/icon_1_1704067200000.jpg",
        "category": {
          "_id": "category_id",
          "name": "Dogs",
          "slug": "dogs",
          "image": "/uploads/pet-categories/category_1_1704067200000.jpg"
        },
        "isActive": true,
        "order": 1,
        "size": "Large",
        "lifeSpan": "10-12 years",
        "temperament": ["Friendly", "Intelligent", "Devoted"],
        "origin": "Scotland",
        "exerciseNeeds": "High",
        "groomingNeeds": "Moderate",
        "popularityRank": 2,
        "goodWithKids": true,
        "goodWithPets": true,
        "hypoallergenic": false,
        "createdAt": "2024-01-02T00:00:00.000Z",
        "updatedAt": "2024-01-02T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
    }
  }
}
```

#### Error Responses

**500 Server Error**
```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

### GET /category/:categoryId
Retrieve all breeds within a specific category.

**Method**: `GET`  
**Authentication**: Not required

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `categoryId` | String | ID of the category to filter breeds |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Breeds fetched successfully",
  "data": {
    "breeds": [
      {
        "_id": "breed_id",
        "name": "Golden Retriever",
        "description": "Friendly and intelligent breed",
        "image": "/uploads/breeds/breed_1_1704067200000.jpg",
        "icon": "/uploads/breeds/icon_1_1704067200000.jpg",
        "category": {
          "_id": "category_id",
          "name": "Dogs",
          "slug": "dogs",
          "image": "/uploads/pet-categories/category_1_1704067200000.jpg"
        },
        "isActive": true,
        "order": 1,
        "size": "Large",
        "lifeSpan": "10-12 years",
        "temperament": ["Friendly", "Intelligent", "Devoted"],
        "origin": "Scotland",
        "exerciseNeeds": "High",
        "groomingNeeds": "Moderate",
        "popularityRank": 2,
        "goodWithKids": true,
        "goodWithPets": true,
        "hypoallergenic": false,
        "createdAt": "2024-01-02T00:00:00.000Z",
        "updatedAt": "2024-01-02T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
    }
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Category not found",
  "error": "No category found with the provided ID"
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

### GET /:slug
Retrieve a specific breed by its slug.

**Method**: `GET`  
**Authentication**: Not required

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | String | Slug of the breed to retrieve |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Breed fetched successfully",
  "data": {
    "_id": "breed_id",
    "name": "Golden Retriever",
    "description": "Friendly and intelligent breed",
    "image": "/uploads/breeds/breed_1_1704067200000.jpg",
    "icon": "/uploads/breeds/icon_1_1704067200000.jpg",
    "category": {
      "_id": "category_id",
      "name": "Dogs",
      "slug": "dogs",
      "image": "/uploads/pet-categories/category_1_1704067200000.jpg"
    },
    "isActive": true,
    "order": 1,
    "size": "Large",
    "lifeSpan": "10-12 years",
    "temperament": ["Friendly", "Intelligent", "Devoted"],
    "origin": "Scotland",
    "exerciseNeeds": "High",
    "groomingNeeds": "Moderate",
    "popularityRank": 2,
    "goodWithKids": true,
    "goodWithPets": true,
    "hypoallergenic": false,
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Breed not found",
  "error": "No breed found with the provided slug"
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

### POST /
Add a new breed. (Admin only)

**Method**: `POST`  
**Authentication**: Admin required  
**Content-Type**: `multipart/form-data`

#### Request Body (Form Data)
```
name: "Golden Retriever" (required)
description: "Friendly and intelligent breed" (required)
image: [FILE] (required) - Breed main image
icon: [FILE] (required) - Breed icon
category: "category_id" (required)
order: 1 (optional)
size: "Large" (optional)
lifeSpan: "10-12 years" (optional)
temperament: ["Friendly", "Intelligent", "Devoted"] (optional)
origin: "Scotland" (optional)
exerciseNeeds: "High" (optional)
groomingNeeds: "Moderate" (optional)
popularityRank: 2 (optional)
goodWithKids: true (optional)
goodWithPets: true (optional)
hypoallergenic: false (optional)
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Breed added successfully",
  "data": {
    "_id": "breed_id",
    "name": "Golden Retriever",
    "description": "Friendly and intelligent breed",
    "image": "/uploads/breeds/breed_1_1704067200000.jpg",
    "icon": "/uploads/breeds/icon_1_1704067200000.jpg",
    "category": {
      "_id": "category_id",
      "name": "Dogs",
      "slug": "dogs",
      "image": "/uploads/pet-categories/category_1_1704067200000.jpg"
    },
    "isActive": true,
    "order": 1,
    "size": "Large",
    "lifeSpan": "10-12 years",
    "temperament": ["Friendly", "Intelligent", "Devoted"],
    "origin": "Scotland",
    "exerciseNeeds": "High",
    "groomingNeeds": "Moderate",
    "popularityRank": 2,
    "goodWithKids": true,
    "goodWithPets": true,
    "hypoallergenic": false,
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Breed already exists",
  "error": "Duplicate breed found"
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

### PUT /:id
Update a breed by its ID. (Admin only)

**Method**: `PUT`  
**Authentication**: Admin required  
**Content-Type**: `application/json`

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | ID of the breed to update |

#### Request Body
```json
{
  "name": "Updated Breed",
  "description": "Updated description"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Breed updated successfully",
  "data": {
    "_id": "breed_id",
    "name": "Updated Breed",
    "description": "Updated description",
    "image": "/uploads/breeds/breed_1_1704067200000.jpg",
    "icon": "/uploads/breeds/icon_1_1704067200000.jpg",
    "category": {
      "_id": "category_id",
      "name": "Dogs",
      "slug": "dogs",
      "image": "/uploads/pet-categories/category_1_1704067200000.jpg"
    },
    "isActive": true,
    "order": 1,
    "size": "Large",
    "lifeSpan": "10-12 years",
    "temperament": ["Friendly", "Intelligent", "Devoted"],
    "origin": "Scotland",
    "exerciseNeeds": "High",
    "groomingNeeds": "Moderate",
    "popularityRank": 2,
    "goodWithKids": true,
    "goodWithPets": true,
    "hypoallergenic": false,
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-03T00:00:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Breed not found",
  "error": "No breed found with the provided ID"
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

### DELETE /:id
Delete a breed by its ID. (Admin only)

**Method**: `DELETE`  
**Authentication**: Admin required

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | ID of the breed to delete |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Breed deleted successfully"
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Breed not found",
  "error": "No breed found with the provided ID"
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

## Notes

- Breeds have a unique slug generated automatically
- Extensive filtering and search options
- Supports pagination and sorting
- Use `isActive` filter for managing public visibility
- All changes tracked with timestamps (`createdAt`, `updatedAt`)

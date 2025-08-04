# Pet Categories API Documentation

The Pet Categories API provides endpoints for managing pet categories including creating, updating, retrieving, and deleting categories.

## Base URL
```
/api/pet-categories
```

## Authentication
🔒 **Note**: Admin authentication is required for creating, updating, and deleting pet categories.

Include the token in the Authorization header:
```
Authorization: Bearer your_admin_jwt_token_here
```

---

## Endpoints

### GET /
Retrieve all pet categories with optional filters, search, sorting, and pagination.

**Method**: `GET`  
**Authentication**: Not required for retrieval

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | Number | No | Page number for pagination |
| `limit` | Number | No | Number of items per page |
| `search` | String | No | Search term for filtering by name or description |
| `sortBy` | String | No | Field to sort by (default: `order`) |
| `sortOrder` | String | No | Sort order, `asc` or `desc` (default: `asc`) |
| `isActive` | Boolean | No | Filter by active status |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Pet categories fetched successfully",
  "data": {
    "categories": [
      {
        "_id": "category_id",
        "name": "Dogs",
        "description": "Loyal and friendly companions",
        "image": "https://example.com/dog-category.jpg",
        "icon": "https://example.com/dog-icon.png",
        "isActive": true,
        "order": 1,
        "slug": "dogs",
        "metaTitle": "Meta Title",
        "metaDescription": "Meta Description",
        "createdAt": "2024-01-02T00:00:00.000Z",
        "updatedAt": "2024-01-02T00:00:00.000Z",
        "breedCount": 12
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

### GET /category/:slug
Retrieve a specific pet category by its slug.

**Method**: `GET`  
**Authentication**: Not required

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | String | Slug of the category to retrieve |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Pet category fetched successfully",
  "data": {
    "_id": "category_id",
    "name": "Dogs",
    "description": "Loyal and friendly companions",
    "image": "https://example.com/dog-category.jpg",
    "icon": "https://example.com/dog-icon.png",
    "isActive": true,
    "order": 1,
    "slug": "dogs",
    "metaTitle": "Meta Title",
    "metaDescription": "Meta Description",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "breedCount": 12
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Category not found",
  "error": "No category found with the provided slug"
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
Add a new pet category. (Admin only)

**Method**: `POST`  
**Authentication**: Admin required  
**Content-Type**: `application/json`

#### Request Body
```json
{
  "name": "Dogs",
  "description": "Loyal and friendly companions",
  "image": "https://example.com/dog-category.jpg",
  "icon": "https://example.com/dog-icon.png",
  "order": 1
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Pet category added successfully",
  "data": {
    "_id": "category_id",
    "name": "Dogs",
    "description": "Loyal and friendly companions",
    "image": "https://example.com/dog-category.jpg",
    "icon": "https://example.com/dog-icon.png",
    "isActive": true,
    "order": 1,
    "slug": "dogs",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "breedCount": 0
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Category already exists",
  "error": "Duplicate category found"
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
Update a pet category by its ID. (Admin only)

**Method**: `PUT`  
**Authentication**: Admin required  
**Content-Type**: `application/json`

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | ID of the category to update |

#### Request Body
```json
{
  "name": "Updated Category",
  "description": "Updated description"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Pet category updated successfully",
  "data": {
    "_id": "category_id",
    "name": "Updated Category",
    "description": "Updated description",
    "image": "https://example.com/dog-category.jpg",
    "icon": "https://example.com/dog-icon.png",
    "isActive": true,
    "order": 1,
    "slug": "updated-category",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-03T00:00:00.000Z",
    "breedCount": 0
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

### DELETE /:id
Delete a pet category by its ID. (Admin only)

**Method**: `DELETE`  
**Authentication**: Admin required

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | ID of the category to delete |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Pet category deleted successfully"
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

## Notes

- Pet categories have a unique slug generated automatically
- The `order` field determines display priority
- Use `isActive` filter to manage public visibility
- All changes tracked with timestamps (`createdAt`, `updatedAt`)

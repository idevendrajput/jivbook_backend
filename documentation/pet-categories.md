# Pet Categories API Documentation

The Pet Categories API provides comprehensive endpoints for managing pet categories including creating, updating, retrieving, and deleting categories with advanced features like image upload, SEO optimization, and admin authorization.

## Features
- **Category Management**: Complete CRUD operations for pet categories
- **Admin Authorization**: Secure admin-only operations for create/update/delete
- **Image Upload**: Support for category images and icons with file handling
- **SEO Optimization**: Meta titles and descriptions for categories
- **Filtering & Search**: Advanced filtering and search capabilities
- **Pagination**: Efficient data handling with pagination
- **Slug Support**: SEO-friendly URLs with auto-generated slugs
- **Breed Count**: Automatic tracking of breeds per category
- **Dairy Pet Classification**: Special classification for dairy animals

## Testing Status
✅ **All APIs Tested & Working** - See [API_TESTING_LOGS.md](./API_TESTING_LOGS.md) for detailed test results

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
**Authentication**: ❌ Not required for retrieval

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | Number | No | Page number for pagination (default: 1) |
| `limit` | Number | No | Number of items per page (default: 10) |
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
        "_id": "689184f22e52d8218db6e6d2",
        "name": "Dogs",
        "description": "Loyal and friendly companions, perfect for families and individuals alike",
        "image": "/uploads/pet-categories/category_1_1704067200000.jpg",
        "icon": "/uploads/pet-categories/icon_1_1704067200000.jpg",
        "isActive": true,
        "order": 1,
        "isDairyPet": false,
        "slug": "dogs",
        "metaTitle": "Dogs - Find Your Perfect Canine Companion",
        "metaDescription": "Discover various dog breeds and find your perfect canine companion",
        "breedCount": 2,
        "createdAt": "2025-08-05T04:13:38.938Z",
        "updatedAt": "2025-08-05T04:13:38.938Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 12,
      "itemsPerPage": 10
    }
  }
}
```

### GET /category/:slug
Retrieve a specific pet category by its slug.

**Method**: `GET`  
**Authentication**: ❌ Not required

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
    "_id": "689184f22e52d8218db6e6d2",
    "name": "Dogs",
    "description": "Loyal and friendly companions",
    "image": "/uploads/pet-categories/category_1_1704067200000.jpg",
    "icon": "/uploads/pet-categories/icon_1_1704067200000.jpg",
    "slug": "dogs",
    "breedCount": 2
  }
}
```

### POST /
Add a new pet category. (Admin only)

**Method**: `POST`  
**Authentication**: ✅ Admin required  
**Content-Type**: `multipart/form-data`

#### Request Body (Form Data)
```
name: "Test Category" (required)
description: "Test description for API testing" (required)
image: file (required) - Category main image
icon: file (required) - Category icon
order: number (optional) - Display order
isDairyPet: boolean (optional, default: false)
metaTitle: "SEO title" (optional)
metaDescription: "SEO description" (optional)
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Pet category added successfully",
  "data": {
    "_id": "689302683f6cb78b927178f0",
    "name": "Test Category",
    "description": "Test description for API testing",
    "image": "category-img-1754464871997-177819748.jpg",
    "icon": "category-icon-1754464871997-876749510.jpg",
    "isActive": true,
    "order": 0,
    "isDairyPet": false,
    "slug": "test-category",
    "metaTitle": null,
    "metaDescription": null,
    "breedCount": 0,
    "createdAt": "2025-08-06T07:21:12.002Z",
    "updatedAt": "2025-08-06T07:21:12.002Z"
  }
}
```

### PUT /:id
Update a pet category by ID. (Admin only)

**Method**: `PUT`  
**Authentication**: ✅ Admin required  
**Content-Type**: `multipart/form-data`

#### Request Body
Same as POST, all fields optional for update.

### DELETE /:id
Delete a pet category by ID. (Admin only)

**Method**: `DELETE`  
**Authentication**: ✅ Admin required

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Category ID to delete |

## Error Responses

### Unauthorized Access (403)
```json
{
  "success": false,
  "message": "Access denied",
  "error": "Admin access required"
}
```

### File Upload Error (400)
```json
{
  "success": false,
  "message": "Image file is required",
  "data": null
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Category not found",
  "error": "No category found with the provided slug"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

## Testing Examples

### Get All Categories
```bash
curl -X GET http://localhost:3010/api/pet-categories
```

### Create Category (Admin)
```bash
curl -X POST http://localhost:3010/api/pet-categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "name=Test Category" \
  -F "description=Test description" \
  -F "image=@/path/to/image.jpg" \
  -F "icon=@/path/to/icon.jpg"
```

### Get Category by Slug
```bash
curl -X GET http://localhost:3010/api/pet-categories/category/dogs
```

## File Upload Guidelines

### Supported Formats
- **Images**: JPG, JPEG, PNG, GIF
- **Max Size**: 5MB per file

### Upload Paths
- **Images**: `/uploads/categories/`
- **Icons**: `/uploads/categories/`

## Notes

- Category slugs are automatically generated from names
- Breed count is automatically calculated and updated
- Image files are required for category creation
- All string fields are automatically trimmed
- Duplicate category names are prevented
- SEO fields are optional but recommended for better search visibility

For complete testing logs and examples, see [API_TESTING_LOGS.md](./API_TESTING_LOGS.md).

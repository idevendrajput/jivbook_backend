# 🖼️ Sliders API Documentation

The Sliders API manages homepage image sliders for the application, providing full CRUD operations with admin controls.

## Base URL
```
/api/slider
```

## Authentication
🔒 **Note**: Admin authentication is required for creating, updating, and deleting sliders.

Include the token in the Authorization header:
```
Authorization: Bearer your_admin_jwt_token_here
```

---

## Endpoints

### GET /get_all
Retrieve all active sliders.

**Method**: `GET`  
**Authentication**: Not required for retrieval

#### Success Response (200)
```json
{
  "success": true,
  "message": "Sliders retrieved successfully",
  "data": [
    {
      "_id": "slider_id",
      "title": "Welcome to Jivbook",
      "description": "Find your perfect pet companion",
      "image": "/uploads/sliders/slider_1_1704067200000.jpg",
      "buttonText": "Get Started",
      "buttonLink": "/pets",
      "isActive": true,
      "order": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "slider_id_2",
      "title": "Pet Care Tips",
      "description": "Learn how to take care of your pets",
      "image": "/uploads/sliders/slider_2_1704067200000.jpg",
      "buttonText": "Learn More",
      "buttonLink": "/care-tips",
      "isActive": true,
      "order": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
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

### POST /add
Add a new slider. (Admin only)

**Method**: `POST`  
**Authentication**: Admin required  
**Content-Type**: `multipart/form-data`

#### Request Body (Form Data)
```
title: "Welcome to Jivbook"
description: "Find your perfect pet companion"
image: [FILE] (image file upload)
buttonText: "Get Started"
buttonLink: "/pets"
order: 1
```

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | String | Yes | Slider title text |
| `description` | String | No | Slider description text |
| `image` | File | Yes | Image file (JPG, PNG, GIF, WEBP - max 10MB) |
| `buttonText` | String | No | Call-to-action button text |
| `buttonLink` | String | No | URL for button link |
| `order` | Number | No | Display order (default: 0) |

#### Success Response (201)
```json
{
  "success": true,
  "message": "Slider added successfully",
  "data": {
    "_id": "slider_id",
    "title": "Welcome to Jivbook",
    "description": "Find your perfect pet companion",
    "image": "/uploads/sliders/slider_1_1704067200000.jpg",
    "buttonText": "Get Started",
    "buttonLink": "/pets",
    "isActive": true,
    "order": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Title and image are required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied",
  "error": "Admin access required"
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

### PUT /update/:id
Update a slider by its ID. (Admin only)

**Method**: `PUT`  
**Authentication**: Admin required  
**Content-Type**: `application/json`

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | ID of the slider to update |

#### Request Body
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "order": 2
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Slider updated successfully",
  "data": {
    "_id": "slider_id",
    "title": "Updated Title",
    "description": "Updated description",
    "image": "/uploads/sliders/slider_1_1704067200000.jpg",
    "buttonText": "Get Started",
    "buttonLink": "/pets",
    "isActive": true,
    "order": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Slider not found",
  "error": "No slider found with the provided ID"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied",
  "error": "Admin access required"
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

### PUT /update_image/:id
Update slider image by its ID. (Admin only)

**Method**: `PUT`  
**Authentication**: Admin required  
**Content-Type**: `multipart/form-data`

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | ID of the slider to update image |

#### Request Body (Form Data)
```
image: [FILE] (new image file upload)
```

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | File | Yes | New image file (JPG, PNG, GIF, WEBP - max 10MB) |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Slider image updated successfully",
  "data": {
    "_id": "slider_id",
    "title": "Welcome to Jivbook",
    "description": "Find your perfect pet companion",
    "image": "/uploads/sliders/slider_1_1704153600000.jpg",
    "buttonText": "Get Started",
    "buttonLink": "/pets",
    "isActive": true,
    "order": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T12:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Image file is required"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Slider not found",
  "error": "No slider found with the provided ID"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied",
  "error": "Admin access required"
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

### DELETE /delete_by_id
Delete a slider by its ID. (Admin only)

**Method**: `DELETE`  
**Authentication**: Admin required

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | ID of the slider to delete |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Slider deleted successfully"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Slider ID is required",
  "error": "Missing required parameter: id"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Slider not found",
  "error": "No slider found with the provided ID"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied",
  "error": "Admin access required"
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

### PATCH /toggle/:id
Toggle slider active status. (Admin only)

**Method**: `PATCH`  
**Authentication**: Admin required

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | ID of the slider to toggle |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Slider status toggled successfully",
  "data": {
    "_id": "slider_id",
    "title": "Welcome to Jivbook",
    "description": "Find your perfect pet companion",
    "image": "/uploads/sliders/slider_1_1704067200000.jpg",
    "buttonText": "Get Started",
    "buttonLink": "/pets",
    "isActive": false,
    "order": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Slider not found",
  "error": "No slider found with the provided ID"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied",
  "error": "Admin access required"
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

## Slider Model Structure

### Slider Object Properties
| Property | Type | Description |
|----------|------|-------------|
| `_id` | String | Unique slider identifier |
| `title` | String | Slider title text |
| `description` | String | Slider description text |
| `image` | String | URL to slider image |
| `buttonText` | String | Call-to-action button text |
| `buttonLink` | String | URL for button link |
| `isActive` | Boolean | Whether slider is active/visible |
| `order` | Number | Display order (ascending) |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

---

## Example Usage

### cURL Examples

#### Get All Sliders
```bash
curl -X GET http://localhost:3001/api/slider/get_all
```

#### Add New Slider (Admin)
```bash
curl -X POST http://localhost:3001/api/slider/add \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -F "title=Welcome to Jivbook" \
  -F "description=Find your perfect pet companion" \
  -F "image=@/path/to/slider-image.jpg" \
  -F "buttonText=Get Started" \
  -F "buttonLink=/pets" \
  -F "order=1"
```

#### Update Slider Text Data (Admin)
```bash
curl -X PUT http://localhost:3001/api/slider/update/SLIDER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "title": "Updated Title",
    "order": 2
  }'
```

#### Update Slider Image (Admin)
```bash
curl -X PUT http://localhost:3001/api/slider/update_image/SLIDER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -F "image=@/path/to/new-slider-image.jpg"
```

#### Delete Slider (Admin)
```bash
curl -X DELETE "http://localhost:3001/api/slider/delete_by_id?id=SLIDER_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Toggle Slider Status (Admin)
```bash
curl -X PATCH http://localhost:3001/api/slider/toggle/SLIDER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### JavaScript Example
```javascript
const getSliders = async () => {
  try {
    const response = await fetch('/api/slider/get_all');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to fetch sliders:', error);
  }
};

const addSlider = async (token, formData) => {
  try {
    const response = await fetch('/api/slider/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // FormData object with image file
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to add slider:', error);
  }
};

// Example usage:
const createSliderFormData = (sliderInfo, imageFile) => {
  const formData = new FormData();
  formData.append('title', sliderInfo.title);
  formData.append('description', sliderInfo.description);
  formData.append('image', imageFile); // File object from input
  formData.append('buttonText', sliderInfo.buttonText);
  formData.append('buttonLink', sliderInfo.buttonLink);
  formData.append('order', sliderInfo.order);
  return formData;
};

const updateSliderImage = async (token, sliderId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`/api/slider/update_image/${sliderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to update slider image:', error);
  }
};
```

---

## Notes

- Only admin users can create, update, or delete sliders
- Sliders are ordered by the `order` field in ascending order
- Only active sliders (`isActive: true`) are returned in the GET endpoint
- Image URLs should be accessible and properly formatted
- Button links can be internal routes or external URLs
- Consider image optimization for better performance

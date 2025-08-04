# 🐾 Pet API

API documentation for managing and accessing pet data, location-based searches, and personalized recommendations in the Jivbook platform.

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
- **Description**: Add a new pet to the marketplace with image uploads.
- **Request Body**: JSON object with pet details including title, description, price, etc.
- **Response Format**: Returns the newly created pet's details.

### Get Pet by ID
- **URL**: `/api/pets/:id`
- **Method**: `GET`
- **Description**: Get detailed information for a specific pet by ID.
- **Response Format**: Returns pet details or error if not found.

### Update a Pet (Admin only)
- **URL**: `/api/pets/:id`
- **Method**: `PUT`
- **Description**: Update details for a specific pet (admin only).
- **Request Body**: JSON object with updated fields.
- **Response Format**: Returns updated pet details or error if not found.

### Delete a Pet (Admin only)
- **URL**: `/api/pets/:id`
- **Method**: `DELETE`
- **Description**: Delete a specific pet (admin only).
- **Response Format**: Success or error message.

### Get Nearby Pets
- **URL**: `/api/pets/nearby`
- **Method**: `GET`
- **Description**: Find pets near a specific location using latitude and longitude.
- **Parameters**:
  - `latitude` & `longitude`: Required user location.
  - `radius`: Optional search radius in kilometers (default 10).
  - Additional filters: `petCategory`, `minPrice`, `maxPrice`.
- **Response Format**: Returns nearby pets with distance in kilometers.

### Get Recommended Pets
- **URL**: `/api/pets/recommended`
- **Method**: `GET`
- **Description**: Fetch recommended pets based on user preferences and location (requires authentication).
- **Parameters**: Standard pagination.
- **Response Format**: Returns recommended pets.

## Common Behavior
- **Authentication**: Relevant endpoints require JWT token in the Authorization header.
- **Filtering & Pagination**: Standardized approach across endpoints.
- **Data Response**: Consistent BaseResponse format for success and error handling.

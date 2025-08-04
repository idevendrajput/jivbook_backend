# Map API Documentation

The Map API integrates Google Places API for searching locations and retrieving place details using keywords.

## Base URL
```
/api/map
```

## Authentication
😃 **None required**: All map-related endpoints are public.

---

## Endpoints

### POST /get-places
Search places using Google Places API with provided text input.

**Method**: `POST`  
**Authentication**: Not required  
**Content-Type**: `application/json`

#### Request Body
```json
{
  "searchText": "Restaurant near me",
  "cities": false
}
```

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `searchText` | String | Yes | Text for searching places |
| `cities` | Boolean | No | Filter results for cities only |

#### Success Response (200)
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

#### Error Responses

**500 Server Error**
```json
{
  "success": false,
  "message": "Failed to fetch map data",
  "error": "Detailed error message"
}
```

---

## Example Usage

### cURL Example
```bash
curl -X POST http://localhost:3001/api/map/get-places \
  -H "Content-Type: application/json" \
  -d '{
    "searchText": "Restaurant near me",
    "cities": false
  }'
```

### JavaScript Example
```javascript
const searchPlaces = async (searchText, isCitiesOnly) => {
  try {
    const response = await fetch('/api/map/get-places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchText, cities: isCitiesOnly })
    });
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to fetch places:', error);
  }
};
```

---

## Notes

- Use `cities: true` to filter results specifically for cities
- Recommended to handle errors gracefully on the client side
- The `mapUrl` is a direct Google Maps link to the location
- Supports extensive search criteria using the Google Places API
- Ensure Google Places API key is active and has sufficient quota
- Rate limiting may apply depending on Google API usage


const express = require('express');
const axios = require('axios');
const router = express.Router();
const BaseResponse = require('../models/BaseResponse');

// Environment variables for API key and URL
const googleApiKey = process.env.GOOGLE_API_KEY;
const googleApiUrl = 'https://maps.googleapis.com/maps/api';

// Fetch latitude, longitude, and map URL by place ID
const getLatLngByPlaceId = async (placeId) => {
  try {
    const response = await axios.get(`${googleApiUrl}/place/details/json`, {
      params: {
        placeid: placeId,
        key: googleApiKey
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch map data');
  }
};

// Place search endpoint
router.post('/get-places', async (req, res) => {
  try {
    const { searchText, cities = false } = req.body;

    const response = await axios.get(`${googleApiUrl}/place/autocomplete/json`, {
      params: {
        input: searchText,
        types: cities ? '(cities)' : '',
        components: 'country:IN',
        key: googleApiKey
      }
    });

    const places = response.data.predictions;
    for (const place of places) {
      if (place.place_id) {
        const latLng = await getLatLngByPlaceId(place.place_id);
        place.latitude = latLng.result.geometry.location.lat;
        place.longitude = latLng.result.geometry.location.lng;
        place.mapUrl = latLng.result.url;
      }
    }

    const result = { predictions: places, status: response.data.status };
    const baseResponse = BaseResponse.success('Places fetched successfully', result);
    res.json(baseResponse);
  } catch (error) {
    const baseResponse = BaseResponse.error('Failed to fetch map data', error.message);
    res.status(500).json(baseResponse);
  }
});

module.exports = router;

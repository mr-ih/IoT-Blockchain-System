// src/api/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetch all sensor events from the backend.
 *
 * @returns {Promise<{ events: Array, error: Error | null, loading: boolean }>}
 */
export const fetchSensorEvents = async () => {
  let loading = true;
  let error = null;
  let events = [];
  try {
    const response = await axios.get(`${API_BASE_URL}/sensor-events`);
    // Assuming the backend returns sensor events wrapped inside an "events" property
    events = response.data.events;
  } catch (err) {
    console.error('Failed to fetch sensor events:', err);
    error = err;
  }
  loading = false;
  return { events, error, loading };
};

/**
 * Fetch sensor events filtered by the specified device type.
 *
 * @param {string} deviceType - The type of device to filter sensor events by.
 * @returns {Promise<{ events: Array, error: Error | null, loading: boolean }>}
 */
export const fetchSensorEventsByDevice = async (deviceType) => {
  let loading = true;
  let error = null;
  let events = [];
  try {
    // The API is assumed to support filtering through query parameters.
    const response = await axios.get(`${API_BASE_URL}/sensor-events`, {
      params: { deviceType },
    });
    events = response.data.events;
  } catch (err) {
    console.error(`Failed to fetch sensor events for device type "${deviceType}":`, err);
    error = err;
  }
  loading = false;
  return { events, error, loading };
};
import axios from 'axios';

// Base URL for the sensor API endpoint
const API_URL = "http://localhost:3000/sensors";

/**
 * Fetch sensor data from the backend for a given sensor ID.
 *
 * @param {string} sensorId - The unique identifier for the sensor.
 * @returns {Object|null} - The sensor data returned by the API or null in case of an error.
 */
export const getSensorData = async (sensorId) => {
    try {
        const response = await axios.get(`${API_URL}/${sensorId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching sensor data:", error);
        return null;
    }
};


import React, { useState, useEffect } from 'react';
import { getSensorData } from '../services/api';

function SensorDashboard() {
    const [sensorData, setSensorData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getSensorData("temp-sensor-1");
            setSensorData(data);
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>IoT Sensor Dashboard</h1>
            {sensorData ? (
                <p>Temperature: {sensorData.value}°C (Timestamp: {sensorData.timestamp})</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default SensorDashboard;


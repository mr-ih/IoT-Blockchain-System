// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { fetchSensorEvents } from '../api/api';
import SensorEventsTable from '../components/tables/SensorEventsTable';

const Dashboard = () => {
  const [sensorEvents, setSensorEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch sensor events when the component mounts.
  useEffect(() => {
    const loadSensorEvents = async () => {
      try {
        setIsLoading(true);
        const events = await fetchSensorEvents(); // Adjust this function as per your API's return structure.
        setSensorEvents(events);
      } catch (error) {
        console.error('Error fetching sensor events:', error);
        setErrorMsg('Error fetching sensor events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSensorEvents();
  }, []);

  // Render loading state or error message if necessary.
  if (isLoading) {
    return <div>Loading sensor events...</div>;
  }

  if (errorMsg) {
    return <div>{errorMsg}</div>;
  }

  return (
    <div className="dashboard">
      <h1>IoT Blockchain Dashboard</h1>
      <SensorEventsTable events={sensorEvents} />
    </div>
  );
};

export default Dashboard;
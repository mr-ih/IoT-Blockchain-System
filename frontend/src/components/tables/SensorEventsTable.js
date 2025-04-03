// src/components/tables/SensorEventTable.js
import React, { useState, useEffect } from 'react';
import { fetchSensorEvents } from '../../api/api';
import './SensorEventTable.css'; // Optional: You can add your custom styles here

const SensorEventsTable = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sensor events on component mount
  useEffect(() => {
    const getEvents = async () => {
      const { events, error } = await fetchSensorEvents();
      if (error) {
        setError(error);
      } else {
        setEvents(events);
      }
      setLoading(false);
    };

    getEvents();
  }, []);

  // Apply filtering by device type and event ID every time events, deviceFilter or searchTerm changes.
  useEffect(() => {
    let data = events.slice();

    // Filter by Event ID if search term is provided
    if (searchTerm.trim() !== '') {
      data = data.filter(event =>
        event.eventID.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Device Type if a specific type is selected
    if (deviceFilter !== 'all') {
      data = data.filter(event => event.deviceType === deviceFilter);
    }

    // Sort data by Timestamp (newest first)
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredEvents(data);
  }, [events, deviceFilter, searchTerm]);

  if (loading) {
    return <div className="loading">Loading sensor event data...</div>;
  }

  if (error) {
    return <div className="error">Failed to load sensor events. Please try again later.</div>;
  }

  return (
    <div className="sensor-events-container">
      <div className="filters">
        <label htmlFor="deviceFilter">
          Device Type:
          <select
            id="deviceFilter"
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
          >
            <option value="all">All Device Types</option>
            <option value="CCTV">CCTV</option>
            <option value="CO2">CO2</option>
            <option value="Smart Light">Smart Light</option>
            <option value="Printer">Printer</option>
            <option value="Card Reader">Card Reader</option>
          </select>
        </label>
        <label htmlFor="eventSearch">
          Search by Event ID:
          <input
            type="text"
            id="eventSearch"
            placeholder="Enter Event ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
      </div>

      <table className="sensor-events-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Device ID</th>
            <th>Device Type</th>
            <th>Event Type</th>
            <th>Event ID</th>
            <th>Location</th>
            <th>Blockchain Transaction Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <tr key={event.eventID}>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
                <td>{event.deviceID}</td>
                <td>{event.deviceType}</td>
                <td>{event.eventType}</td>
                <td>{event.eventID}</td>
                <td>{event.location}</td>
                <td>{event.transactionStatus}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No sensor events found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SensorEventsTable;
// src/pages/Sensors.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar/Sidebar";
import BarChart from "../components/Charts/BarChart";
import ScatterChart from "../components/Charts/ScatterChart";
import LineChart from "../components/Charts/LineChart";
import "./sensor.module.css"; // Modular CSS for sensors layout

// API configuration for sensor data
const apiUrl = "http://localhost:5000/api/sensors/data";
const apiKey = "2239567a-35e5-48bf-9853-e7fac6e16e13";

const Sensors = () => {
  // State for raw sensor data and formatted chart data
  const [sensorsData, setSensorsData] = useState([]);
  const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [availabilityData, setAvailabilityData] = useState({ labels: [], datasets: [] });

  // Fetch sensor data and process it for the charts
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await axios.get(apiUrl, {
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": apiKey,
          },
        });

        // Data object as received from the backend
        const data = response.data;
        console.log("Sensor Data:", data);

        // Process the raw data for chart components.
        // Using sensorType as label for each sensor entry.
        const labels = data.map(({ sensorType }) => sensorType);
        const integrityMetrics = data.map(({ integrityLevel }) => integrityLevel);
        const networkSecurityMetrics = data.map(({ securityIncidents }) => securityIncidents);
        const availabilityMetrics = data.map(({ availability }) => availability);
        const mobilityMetrics = data.map(({ mobilityRate }) => mobilityRate);

        // Update BarChart data: Integrity Levels by sensor
        setBarChartData({
          labels,
          datasets: [
            {
              label: "Integrity Levels",
              data: integrityMetrics,
              backgroundColor: [
                "rgba(75, 192, 192, 1)",
                "rgba(231, 76, 60, 1)",
                "rgba(142, 68, 173, 1)",
                "rgba(52, 152, 219, 1)",
                "rgba(46, 204, 113, 1)",
              ],
              borderColor: "black",
              borderWidth: 1,
            },
          ],
        });

        // Update LineChart data: Security Incidents by sensor
        setLineChartData({
          labels,
          datasets: [
            {
              label: "Security Incidents",
              data: networkSecurityMetrics,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderWidth: 2,
              tension: 0.4,
            },
          ],
        });

        // Update Availability/Mobility Chart data with dual datasets
        setAvailabilityData({
          labels,
          datasets: [
            {
              label: "Availability %",
              data: availabilityMetrics,
              backgroundColor: "rgba(75,192,192,0.6)",
              borderColor: "rgba(75,192,192,1)",
              borderWidth: 2,
            },
            {
              label: "Mobility Impact Rate",
              data: mobilityMetrics,
              backgroundColor: "rgba(255,206,86,0.6)",
              borderColor: "rgba(255,206,86,1)",
              borderWidth: 2,
            },
          ],
        });

        // Save the raw sensor data if you need it for further processing
        setSensorsData(data);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    // Initial fetch of sensor data
    fetchSensorData();

    // Set up polling to fetch data every 5 seconds for real-time updates
    const intervalId = setInterval(fetchSensorData, 5000);

    // Cleanup the polling interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="dashboard">
      <Sidebar /> {/* Sidebar for navigation */}
      <div className="chart-container">
        <div className="chart">
          <BarChart
            dataset={barChartData.datasets[0]?.data}
            title="Integrity Levels by Sensor"
          />
        </div>
        <div className="chart">
          <LineChart
            dataset={lineChartData.datasets[0]?.data}
            title="Security Incidents by Sensor"
          />
        </div>
        <div className="chart">
          <ScatterChart
            data={sensorsData.map(({ location }) => ({ x: location.x, y: location.y }))}
            title="Sensor Locations and Mobility"
          />
        </div>
        <div className="chart">
          <LineChart
            dataset={availabilityData.datasets}
            title="Availability & Mobility Impact"
          />
        </div>
      </div>
    </div>
  );
};

export default Sensors;
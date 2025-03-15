// App.js
// Main entry point for the IoT Blockchain Sensor Dashboard React application

import React from 'react';
import './App.css'; // Import custom styles
import SensorDashboard from './components/SensorDashboard'; // Import the SensorDashboard component

/**
 * App Component
 * This is the main component that sets up the layout for the dashboard.
 * It includes a header and the main sensor dashboard component.
 */
function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* Display the application title */}
        <h1>IoT Blockchain Sensor Dashboard</h1>
        <p>Monitor and interact with sensor data stored on the blockchain</p>
      </header>
      <main className="App-main">
        {/* Render the sensor dashboard which handles data display and interaction */}
        <SensorDashboard />
      </main>
      <footer className="App-footer">
        {/* Optional footer for copyright or additional information */}
        <p>&copy; {new Date().getFullYear()} IoT Blockchain Project</p>
      </footer>
    </div>
  );
}

export default App;


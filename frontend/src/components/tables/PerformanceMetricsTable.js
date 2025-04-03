// src/components/tables/PerformanceMetricsTable.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './PerformanceMetricsTable.css';

// Simulated performance metrics data
const simulatedMetrics = [
  {
    metricType: 'Latency',
    value: 50,
    unit: 'ms',
    timestamp: new Date(new Date().getTime() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    notes: 'Normal',
  },
  {
    metricType: 'CPU',
    value: 70,
    unit: '%',
    timestamp: new Date(new Date().getTime() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
    notes: 'High load',
  },
  {
    metricType: 'Memory',
    value: 1500,
    unit: 'MB',
    timestamp: new Date(new Date().getTime() - 4 * 60 * 1000).toISOString(), // 4 minutes ago
    notes: 'Stable usage',
  },
  {
    metricType: 'Throughput',
    value: 300,
    unit: 'MB',
    timestamp: new Date(new Date().getTime() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    notes: 'Normal throughput',
  },
  {
    metricType: 'Latency',
    value: 80,
    unit: 'ms',
    timestamp: new Date(new Date().getTime() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
    notes: 'Slight delay detected',
  },
  // Add more simulated data as required...
];

const PerformanceMetricsTable = () => {
  const [timeRange, setTimeRange] = useState('All');
  const [filteredMetrics, setFilteredMetrics] = useState(simulatedMetrics);

  // Filter metrics based on the selected time range on mount and timeRange change
  useEffect(() => {
    const now = new Date();
    let filtered = [];

    if (timeRange === 'Last 5 min') {
      filtered = simulatedMetrics.filter(metric => {
        const metricDate = new Date(metric.timestamp);
        return now - metricDate <= 5 * 60 * 1000; // 5 minutes
      });
    } else if (timeRange === 'Last 1 hr') {
      filtered = simulatedMetrics.filter(metric => {
        const metricDate = new Date(metric.timestamp);
        return now - metricDate <= 60 * 60 * 1000; // 1 hour
      });
    } else {
      filtered = simulatedMetrics;
    }

    setFilteredMetrics(filtered);
  }, [timeRange]);

  // Prepare data for the optional trend line chart for Latency
  const prepareChartData = () => {
    const latencyMetrics = filteredMetrics.filter(metric => metric.metricType === 'Latency');
    return {
      labels: latencyMetrics.map(metric =>
        new Date(metric.timestamp).toLocaleTimeString()
      ),
      datasets: [
        {
          label: 'Latency (ms)',
          data: latencyMetrics.map(metric => metric.value),
          fill: false,
          borderColor: 'blue',
        },
      ],
    };
  };

  return (
    <div className="performance-metrics-container">
      <div className="header">
        <h2>Performance Metrics</h2>
        <div className="time-range-selector">
          <label htmlFor="timeRange">Time Range:</label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="Last 5 min">Last 5 min</option>
            <option value="Last 1 hr">Last 1 hr</option>
            <option value="All">All</option>
          </select>
        </div>
      </div>

      <div className="content-area">
        <table className="metrics-table">
          <thead>
            <tr>
              <th>Metric Type</th>
              <th>Value (ms / % / MB)</th>
              <th>Timestamp</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredMetrics.length > 0 ? (
              filteredMetrics.map((metric, index) => (
                <tr key={index}>
                  <td>{metric.metricType}</td>
                  <td>
                    {metric.value} {metric.unit}
                  </td>
                  <td>{new Date(metric.timestamp).toLocaleString()}</td>
                  <td>{metric.notes}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No metrics available for the selected time range.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Optional: Trend line chart for Latency */}
        <div className="trend-chart">
          <h3>Latency Trend</h3>
          <Line data={prepareChartData()} />
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsTable;
// src/components/tables/AttackResultsTable.js
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './AttackResultsTable.css'; // Optional: Create this file for custom styles

const simulatedData = [
  {
    testType: 'Impersonation',
    attackMethod: 'Spoofing',
    outcome: 'Pass',
    description: 'Authentication bypass prevented.',
    timestamp: '2023-10-10T10:15:00Z',
  },
  {
    testType: 'Data Tampering',
    attackMethod: 'Man-in-the-middle',
    outcome: 'Fail',
    description: 'Data was manipulated during transmission.',
    timestamp: '2023-10-11T12:30:00Z',
  },
  {
    testType: 'DoS',
    attackMethod: 'Flooding',
    outcome: 'Pass',
    description: 'System mitigated excessive requests successfully.',
    timestamp: '2023-10-12T09:45:00Z',
  },
  // Add additional simulated data as needed...
];

const AttackResultsTable = () => {
  const [data] = useState(simulatedData);

  // Convert the table data to CSV and trigger a download.
  const downloadCSV = () => {
    const header = ['Test Type', 'Attack Method', 'Outcome', 'Description', 'Timestamp'];
    const rows = data.map(row => [
      row.testType,
      row.attackMethod,
      row.outcome,
      row.description,
      new Date(row.timestamp).toLocaleString(),
    ]);

    let csvContent =
      'data:text/csv;charset=utf-8,' +
      [header, ...rows]
        .map(e => e.map(val => `"${val}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'attack_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create a PDF of the table using jsPDF and trigger a download.
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    const startY = 20;
    doc.text('Attack Test Results', 14, 14);
    const headers = [['Test Type', 'Attack Method', 'Outcome', 'Description', 'Timestamp']];

    const rows = data.map(row => [
      row.testType,
      row.attackMethod,
      row.outcome,
      row.description,
      new Date(row.timestamp).toLocaleString(),
    ]);

    // Use autoTable plugin if available (or you can create your own logic)
    if (doc.autoTable) {
      doc.autoTable({
        head: headers,
        body: rows,
        startY,
      });
    } else {
      // Fallback simple text rendering if autoTable isn't installed
      let y = startY;
      rows.forEach((row, idx) => {
        doc.text(row.join(' | '), 14, y);
        y += 10;
      });
    }
    doc.save('attack_results.pdf');
  };

  return (
    <div className="attack-results-container">
      <h2>Attack Test Results</h2>
      <div className="download-buttons">
        <button onClick={downloadCSV}>Download CSV</button>
        <button onClick={downloadPDF}>Download PDF</button>
      </div>
      <table className="attack-results-table">
        <thead>
          <tr>
            <th>Test Type</th>
            <th>Attack Method</th>
            <th>Outcome</th>
            <th>Description</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((result, index) => (
            <tr key={index}>
              <td>{result.testType}</td>
              <td>{result.attackMethod}</td>
              <td>
                <span
                  className={`badge ${result.outcome === 'Pass' ? 'badge-pass' : 'badge-fail'}`}
                >
                  {result.outcome}
                </span>
              </td>
              <td>{result.description}</td>
              <td>{new Date(result.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttackResultsTable;
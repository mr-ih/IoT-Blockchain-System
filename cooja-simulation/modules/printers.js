'use strict';

const dgram = require('dgram');
const socket = dgram.createSocket('udp6');

const HOST_IPV6 = 'aaaa::1';     // IPv6 address used in your Contiki code
const PORT_OUT = 5555;           // Local UDP port for sending (matches UDP_PORT_OUT)
const PORT_CENTRAL = 8845;       // Destination UDP port (matches UDP_PORT_CENTRAL)

let eventCounter = 1;

// Bind the UDP socket to the local IPv6 address and port.
socket.bind(PORT_OUT, HOST_IPV6, () => {
  const address = socket.address();
  console.log(`[Printer Sender] Bound to ${address.address}:${address.port}`);
});

// Send a printer event every 2 seconds (simulating CLOCK_REPORT in the C code)
setInterval(sendPrinterEvent, 2000);

function sendPrinterEvent() {
  // Generate a random number of pages printed between 1 and 20.
  const pagesPrinted = Math.floor(Math.random() * 20) + 1;

  // Build the JSON payload similar to your C code.
  // The payload keys are "eventID", "deviceType", "deviceID", "timestamp", "eventType", "location", and "metadata".
  const payload = {
    eventID: `printer_${String(eventCounter).padStart(3, '0')}`,
    deviceType: "printer",
    deviceID: "printer_1",
    timestamp: "2025-03-14T09:30:00Z",
    eventType: "completed",
    location: "Library",
    metadata: `jobID:job_${String(eventCounter).padStart(3, '0')}; pagesPrinted:${pagesPrinted}; userID:student${eventCounter}`
  };

  const message = Buffer.from(JSON.stringify(payload));

  console.log("Sending printer event data to UDP Server at border router...\n", payload);

  // Send the message to the UDP server at HOST_IPV6 / PORT_CENTRAL.
  socket.send(message, 0, message.length, PORT_CENTRAL, HOST_IPV6, (err) => {
    if (err) {
      console.error("Error sending UDP message:", err);
    }
  });

  eventCounter++;
}
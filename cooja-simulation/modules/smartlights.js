'use strict';

const dgram = require('dgram');
const socket = dgram.createSocket('udp6');

// Using the same IPv6 address as in your Contiki code.
const HOST_IPV6 = 'aaaa::1';  
const PORT_OUT = 5555;          // Local sending port (aligns with UDP_PORT_OUT)
const PORT_CENTRAL = 8843;      // UDP destination port (aligns with UDP_PORT_CENTRAL)

let eventCounter = 1;

// Bind the UDP socket to the local IPv6 address and port.
socket.bind(PORT_OUT, HOST_IPV6, () => {
  const address = socket.address();
  console.log(`[Smart Light Sender] Bound to ${address.address}:${address.port}`);
});

// Send a smart light event every 2 seconds
setInterval(sendSmartLightEvent, 2000);

function sendSmartLightEvent() {
  // Generate dynamic values
  const brightness = Math.floor(Math.random() * 51) + 50; // Random value: 50-100
  const energyConsumption = Math.floor(Math.random() * 10) + 1; // Random value: 1-10 Watts
  const eventType = eventCounter % 2 === 0 ? 'off' : 'on';

  // Build the JSON payload similar to the C example
  const payload = {
    eventID: `light_${String(eventCounter).padStart(3, '0')}`,
    deviceType: "light",
    deviceID: "light_05",
    timestamp: "2025-03-14T18:45:00Z",
    eventType: eventType,
    location: "Building B - Corridor",
    metadata: `brightness:${brightness}; energyConsumption:${energyConsumption}W`
  };

  const message = Buffer.from(JSON.stringify(payload));
  console.log("Sending smart light event data to UDP Server:", payload);

  // Send the payload over UDP to the designated IPv6 address and port.
  socket.send(message, 0, message.length, PORT_CENTRAL, HOST_IPV6, (err) => {
    if (err) {
      console.error("Error sending UDP message:", err);
    }
  });

  eventCounter++;
}
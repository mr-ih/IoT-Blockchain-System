'use strict';

const dgram = require('dgram');
const udpSocket = dgram.createSocket('udp6');

// Define UDP ports and IPv6 address to match the C example:
const UDP_PORT_CENTRAL = 8844;   // Destination (central) UDP port
const UDP_PORT_OUT = 5555;       // Local (outgoing) UDP port
const HOST_IPV6 = 'aaaa::1';     // IPv6 address (both for binding and for destination)

// Event counter (mimicking "event_counter" in C)
let eventCounter = 1;

// When the socket starts listening, log the active address & port:
udpSocket.on('listening', () => {
  const address = udpSocket.address();
  console.log(`[UDP - IPv6] Socket is listening on ${address.address}:${address.port}`);
});

// The "message" event handler mimics the cb_receive_udp() callback in C
udpSocket.on('message', (message, remote) => {
  console.log("########## UDP #########");
  console.log(`Received from ${remote.address}:${remote.port} - ${message}`);
});

// Bind the UDP socket to the local port and IPv6 address:
udpSocket.bind(UDP_PORT_OUT, HOST_IPV6, () => {
  console.log(`[UDP - IPv6] Socket bound to ${HOST_IPV6}:${UDP_PORT_OUT}`);
});

// Function to send a card swipe event (similar to the periodic JSON payload in C)
function sendCardSwipeEvent() {
  // Create a dynamic card swipe event payload:
  const userId = Math.floor(Math.random() * 1000); // Random user ID (< 1000)
  const cardId = Math.floor(Math.random() * 1000); // Random card ID (< 1000)
  
  const eventData = {
    eventID: `card_${String(eventCounter).padStart(3, '0')}`,
    deviceType: "card_reader",
    deviceID: "reader_01",
    timestamp: "2025-03-14T10:15:30Z",
    eventType: "swipe",
    location: "Building A - Main Entrance",
    metadata: `userID:user${userId}; cardID:card${cardId}`
  };

  // Convert the JSON object to a string and then to a Buffer:
  const messageBuffer = Buffer.from(JSON.stringify(eventData));
  
  console.log("Sending card swipe event to UDP Server at border router...");

  // Send the message using the UDP socket to the "central" server address and port
  udpSocket.send(messageBuffer, 0, messageBuffer.length, UDP_PORT_CENTRAL, HOST_IPV6, (err) => {
    if (err) {
      console.error("Error sending UDP message:", err);
    } else {
      console.log("Message sent successfully:", eventData);
    }
  });

  eventCounter++; // Increment the event counter for the next event
}

// Set a periodic timer (every 2000 ms = 2 seconds) to send the event
setInterval(sendCardSwipeEvent, 2000);
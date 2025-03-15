/**
 * @file auth_sensor.c
 * @brief Simulated IoT device authentication sensor.
 *
 * This Contiki process simulates an IoT device that needs to authenticate
 * itself to a blockchain network (via an API gateway). The device generates
 * a challenge, "signs" it using its (simulated) private key, and sends an HTTP
 * POST request with its device ID, the challenge, and the signature.
 *
 */

#include "contiki.h"
#include "net/ip/uip.h"
#include "net/ip/uiplib.h"
#include "net/ip/tcp-socket.h"
#include "sys/ctimer.h"
#include "dev/button-sensor.h"
#include <stdio.h>
#include <string.h>

/* Configuration parameters */
#define SERVER_IP "192.168.1.100"     // Set this to your API gateway's IP address
#define SERVER_PORT 3000              // The API gateway port
#define SEND_INTERVAL (30 * CLOCK_SECOND)
#define BUFFER_SIZE 256

/* Simulated device information */
#define DEVICE_ID "device-001"
#define PRIVATE_KEY "simulated-private-key" // Placeholder for actual ECDSA private key

/* Global variables */
static struct ctimer send_timer;
static struct tcp_socket socket;
static uint8_t send_buffer[BUFFER_SIZE];

/**
 * @brief Simulate signing a challenge using the device's private key.
 *
 * For simulation purposes, this function creates a dummy signature.
 *
 * @param challenge The challenge string received from the gateway.
 * @param signature Pointer to the buffer where the signature will be stored.
 * @param sig_size Size of the signature buffer.
 */
static void sign_challenge(const char *challenge, char *signature, size_t sig_size) {
  // In a real implementation, use a cryptographic library (e.g., TinyCrypt) to sign the challenge.
  snprintf(signature, sig_size, "SIGN(%s,%s)", challenge, PRIVATE_KEY);
}

/**
 * @brief Send an authentication request to the blockchain gateway API.
 *
 * This function builds an HTTP POST request containing the device ID,
 * a generated challenge, and the corresponding signature, then sends
 * it over a TCP connection.
 */
static void send_authentication_request() {
  char challenge[64];
  char signature[128];
  char payload[BUFFER_SIZE];

  // Generate a challenge (for simulation, using the system clock)
  snprintf(challenge, sizeof(challenge), "challenge-%lu", clock_time());

  // Simulate signing the challenge using the device's private key
  sign_challenge(challenge, signature, sizeof(signature));

  // Build the JSON payload with device authentication information
  snprintf(payload, sizeof(payload),
           "{\"deviceId\":\"%s\",\"challenge\":\"%s\",\"signature\":\"%s\"}",
           DEVICE_ID, challenge, signature);

  // Construct the HTTP POST request (Content-Length computed from the payload length)
  snprintf((char *)send_buffer, BUFFER_SIZE,
           "POST /authenticate HTTP/1.1\r\n"
           "Host: %s:%d\r\n"
           "Content-Type: application/json\r\n"
           "Content-Length: %lu\r\n\r\n"
           "%s",
           SERVER_IP, SERVER_PORT, strlen(payload), payload);

  /* Convert SERVER_IP string to uip_ipaddr_t structure */
  uip_ipaddr_t server_addr;
  uiplib_ipaddrconv(SERVER_IP, &server_addr);

  /* Register and connect the TCP socket */
  tcp_socket_register(&socket, NULL, send_buffer, BUFFER_SIZE, send_buffer, BUFFER_SIZE, NULL, NULL);
  tcp_socket_connect(&socket, &server_addr, UIP_HTONS(SERVER_PORT));

  /* Send the HTTP POST request */
  tcp_socket_send(&socket, send_buffer, strlen((char *)send_buffer));

  printf("Sent authentication request: %s\n", payload);
}

/**
 * @brief Process that simulates the IoT device sensor.
 *
 * The process sends an authentication request periodically and can also
 * trigger an immediate send on a button press.
 */
PROCESS(auth_sensor_process, "IoT Authentication Sensor");
AUTOSTART_PROCESSES(&auth_sensor_process);

PROCESS_THREAD(auth_sensor_process, ev, data) {
  PROCESS_BEGIN();

  /* Activate a button sensor to allow manual trigger of authentication */
  SENSORS_ACTIVATE(button_sensor);

  /* Set an initial timer to send the authentication request */
  ctimer_set(&send_timer, SEND_INTERVAL, send_authentication_request, NULL);

  while (1) {
    PROCESS_WAIT_EVENT();

    /* If the button sensor is pressed, send an immediate authentication request */
    if (ev == sensors_event && data == &button_sensor) {
      printf("Button pressed: sending immediate authentication request.\n");
      send_authentication_request();
    }
  }

  PROCESS_END();
}

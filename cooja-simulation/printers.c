#include "contiki.h"
#include "net/ip/uip.h"
#include "net/ip/uip-udp-packet.h"
#include "sys/etimer.h"
#include "lib/random.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define UDP_LOCAL_PORT 1234
#define UDP_SERVER_PORT 1234

/* Define a unique device ID for this Printer node */
#define DEVICE_ID "printer_1"

/* Printer statuses */
enum {
  PRINTER_IDLE = 0,
  PRINTER_PRINTING,
  PRINTER_ERROR
};

static struct uip_udp_conn *client_conn;
static uip_ipaddr_t server_ip;

PROCESS(printer_process, "Printer Node");
AUTOSTART_PROCESSES(&printer_process);

PROCESS_THREAD(printer_process, ev, data)
{
  static struct etimer timer;
  static int last_status = -1;   /* Initially no status sent */
  static int printer_status;     /* 0: idle, 1: printing, 2: error */
  char json_log[256];
  char timestamp[32];
  unsigned long now;

  PROCESS_BEGIN();

  /* Create a new UDP connection.
     We create a new UDP connection without specifying a remote address.
     Later, we explicitly send messages to the server_ip. */
  client_conn = udp_new(NULL, UIP_HTONS(UDP_SERVER_PORT), NULL);
  if(client_conn == NULL) {
    printf("No UDP connection available, exiting\n");
    PROCESS_EXIT();
  }
  /* Bind this connection to the local UDP port */
  udp_bind(client_conn, UIP_HTONS(UDP_LOCAL_PORT));

  /* Set up the server IP address.
     In this example the gateway server is set to fe80::1.
     Adjust the address if necessary. */
  uip_ip6addr(&server_ip, 0xfe80, 0, 0, 0, 0, 0, 0, 1);

  /* Set timer to fire every 15 seconds */
  etimer_set(&timer, CLOCK_SECOND * 15);

  while(1) {
    PROCESS_WAIT_EVENT_UNTIL(etimer_expired(&timer));

    /* Generate a candidate printer status randomly (0: idle, 1: printing, 2: error) */
    printer_status = rand() % 3;

    /* Enforce alternating status: if candidate equals last_status, shift to the next state */
    if(printer_status == last_status) {
      printer_status = (printer_status + 1) % 3;
    }
    last_status = printer_status;

    /* Generate a timestamp using Contiki’s clock_seconds() */
    now = clock_seconds();
    snprintf(timestamp, sizeof(timestamp), "%lu", now);

    /* Build a JSON-formatted log string */
    snprintf(json_log, sizeof(json_log),
             "{\"deviceID\":\"%s\",\"timestamp\":\"%s\",\"eventType\":\"printer\",\"status\":%d}",
             DEVICE_ID, timestamp, printer_status);
    printf("Generated Event: %s\n", json_log);

    /* Send the JSON message via UDP to the gateway server */
    uip_udp_packet_sendto(client_conn, json_log, strlen(json_log) + 1,
                          &server_ip, UIP_HTONS(UDP_SERVER_PORT));

    etimer_reset(&timer);
  }

  PROCESS_END();
}

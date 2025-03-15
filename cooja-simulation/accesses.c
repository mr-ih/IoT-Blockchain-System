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

/* Define a unique device ID for this access control terminal */
#define DEVICE_ID "access_terminal_1"

static struct uip_udp_conn *client_conn;
static uip_ipaddr_t server_ip;

PROCESS(access_control_process, "Access Control Node");
AUTOSTART_PROCESSES(&access_control_process);

PROCESS_THREAD(access_control_process, ev, data)
{
  static struct etimer timer;
  static int last_status = -1; /* Initially no status sent */
  static int door_status;      /* 0 for locked, 1 for unlocked */
  char json_log[256];
  char timestamp[32];
  unsigned long now;

  PROCESS_BEGIN();

  /* Create a new UDP connection.
     The udp_new() call is used to create a new UDP connection without specifying
     a remote address. Later, we explicitly send messages to the server_ip. */
  client_conn = udp_new(NULL, UIP_HTONS(UDP_SERVER_PORT), NULL);
  if(client_conn == NULL) {
    printf("No UDP connection available, exiting\n");
    PROCESS_EXIT();
  }
  /* Bind this connection to the local UDP port */
  udp_bind(client_conn, UIP_HTONS(UDP_LOCAL_PORT));

  /* Set up the server IP address.
     In this example we use fe80::1 as a placeholder for the gateway server.
     Adjust the address if necessary. */
  uip_ip6addr(&server_ip, 0xfe80, 0, 0, 0, 0, 0, 0, 1);

  /* Set timer to fire every 15 seconds */
  etimer_set(&timer, CLOCK_SECOND * 15);

  while(1) {
    PROCESS_WAIT_EVENT_UNTIL(etimer_expired(&timer));

    /* Generate a candidate door status randomly (0 or 1) */
    door_status = rand() % 2;

    /* Enforce alternating status: if candidate equals last_status, flip it */
    if(door_status == last_status) {
      door_status = (door_status == 0) ? 1 : 0;
    }
    last_status = door_status;

    /* Generate a timestamp using Contiki’s clock_seconds() */
    now = clock_seconds();
    snprintf(timestamp, sizeof(timestamp), "%lu", now);

    /* Build a JSON-formatted log string for debugging */
    snprintf(json_log, sizeof(json_log),
             "{\"deviceID\":\"%s\",\"timestamp\":\"%s\",\"eventType\":\"access_control\",\"status\":%d}",
             DEVICE_ID, timestamp, door_status);
    printf("Generated Event: %s\n", json_log);

    /* Send the JSON message via UDP to the gateway server */
    uip_udp_packet_sendto(client_conn, json_log, strlen(json_log) + 1, &server_ip, UIP_HTONS(UDP_SERVER_PORT));

    etimer_reset(&timer);
  }

  PROCESS_END();
}

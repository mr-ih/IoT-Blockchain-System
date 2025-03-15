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

/* Define a unique device ID for this Smart Light node */
#define DEVICE_ID "smart_light_1"

static struct uip_udp_conn *client_conn;
static uip_ipaddr_t server_ip;

PROCESS(smart_light_process, "Smart Light Node");
AUTOSTART_PROCESSES(&smart_light_process);

PROCESS_THREAD(smart_light_process, ev, data)
{
  static struct etimer timer;
  static int light_state = 0; /* 0 for off, 1 for on */
  char json_log[256];
  char timestamp[32];
  unsigned long now;

  PROCESS_BEGIN();

  /* Create a new UDP connection.
     We create the UDP connection without specifying a remote address initially,
     then explicitly send packets to the server_ip later. */
  client_conn = udp_new(NULL, UIP_HTONS(UDP_SERVER_PORT), NULL);
  if(client_conn == NULL) {
    printf("No UDP connection available, exiting\n");
    PROCESS_EXIT();
  }
  /* Bind this connection to the local UDP port */
  udp_bind(client_conn, UIP_HTONS(UDP_LOCAL_PORT));

  /* Set up the server IP address.
     In this example, the gateway server is set to fe80::1.
     Adjust this address if necessary. */
  uip_ip6addr(&server_ip, 0xfe80, 0, 0, 0, 0, 0, 0, 1);

  /* Set timer to fire every 15 seconds */
  etimer_set(&timer, CLOCK_SECOND * 15);

  while(1) {
    PROCESS_WAIT_EVENT_UNTIL(etimer_expired(&timer));

    /* Toggle the light state: off (0) becomes on (1) and vice versa */
    light_state = (light_state == 0) ? 1 : 0;

    /* Generate a timestamp using Contiki’s clock_seconds() */
    now = clock_seconds();
    snprintf(timestamp, sizeof(timestamp), "%lu", now);

    /* Build a JSON-formatted log string */
    snprintf(json_log, sizeof(json_log),
             "{\"deviceID\":\"%s\",\"timestamp\":\"%s\",\"eventType\":\"smart_light\",\"state\":%d}",
             DEVICE_ID, timestamp, light_state);
    printf("Generated Event: %s\n", json_log);

    /* Send the JSON message via UDP to the gateway server */
    uip_udp_packet_sendto(client_conn, json_log, strlen(json_log) + 1,
                          &server_ip, UIP_HTONS(UDP_SERVER_PORT));

    etimer_reset(&timer);
  }

  PROCESS_END();
}

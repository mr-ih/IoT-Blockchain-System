#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <float.h>
#include "contiki.h"
#include "contiki-net.h"
#include "dev/serial-line.h"
#include "net/ipv6/uip-ds6.h"
#include "sys/etimer.h"
#include "simple-udp.h"
#include "net/ip/uip-debug.h"

#define UDP_PORT_CENTRAL 8843
#define UDP_PORT_OUT 5555
#define CLOCK_REPORT CLOCK_SECOND * 2

static struct simple_udp_connection broadcast_connection;
static uip_ipaddr_t server_addr;
static uint16_t central_addr[] = { 0xaaaa, 0, 0, 0, 0, 0, 0, 0x1 };

void connect_udp_server();
void uip_debug_ipaddr_print(const uip_ipaddr_t *addr);
int ipaddr_sprintf(char *buf, uint8_t buf_len, const uip_ipaddr_t *addr);
int sicslowpan_get_last_rssi();

PROCESS(init_system_proc, "Init system process");
AUTOSTART_PROCESSES(&init_system_proc);

PROCESS_THREAD(init_system_proc, ev, data)
{
  PROCESS_BEGIN();
  static struct etimer periodic_timer;
  uint8_t buff_udp[256], device_address[30], device_id[17];
  static int event_counter = 1;
  int brightness;
  int energyConsumption;
  char eventType[4]; // "on" or "off"

  sprintf((char *)device_id, "%02X%02X%02X%02X%02X%02X%02X%02X",
          linkaddr_node_addr.u8[0], linkaddr_node_addr.u8[1],
          linkaddr_node_addr.u8[2], linkaddr_node_addr.u8[3],
          linkaddr_node_addr.u8[4], linkaddr_node_addr.u8[5],
          linkaddr_node_addr.u8[6], linkaddr_node_addr.u8[7]);
  sprintf((char *)device_address, "[%c%c%c%c]-Device-%s",
          device_id[12], device_id[13], device_id[14], device_id[15],
          device_id);
  
  connect_udp_server();
  etimer_set(&periodic_timer, CLOCK_REPORT);
  printf("Device initialized - %s\n", device_address);

  while (1) {
    PROCESS_YIELD();

    if (etimer_expired(&periodic_timer)) {
      etimer_reset(&periodic_timer);

      /* Generate dynamic values for brightness (50-100) and energy consumption (1-10 Watts) */
      brightness = rand() % 51 + 50;
      energyConsumption = rand() % 10 + 1;
      
      /* Alternate event type between "on" and "off" */
      if (event_counter % 2 == 0) {
        strcpy(eventType, "off");
      } else {
        strcpy(eventType, "on");
      }
      
      /* Build the dynamic JSON payload for the smart light event.
       * Fixed device parameters are used; dynamic values are inserted for eventID,
       * eventType, brightness, and energyConsumption.
       */
      sprintf((char *)buff_udp,
              "{"
                "\"eventID\": \"light_%03d\","
                "\"deviceType\": \"light\","
                "\"deviceID\": \"light_05\","
                "\"timestamp\": \"2025-03-14T18:45:00Z\","
                "\"eventType\": \"%s\","
                "\"location\": \"Building B - Corridor\","
                "\"metadata\": \"brightness:%d; energyConsumption:%dW\""
              "}",
              event_counter,
              eventType,
              brightness,
              energyConsumption);

      event_counter++;

      printf("Sending smart light event data to UDP Server at border router...\n");
      simple_udp_sendto(&broadcast_connection,
                        buff_udp,
                        strlen((const char *)buff_udp),
                        &server_addr);
    }
  }
  PROCESS_END();
}

void cb_receive_udp(struct simple_udp_connection *c,
                    const uip_ipaddr_t *sender_addr,
                    uint16_t sender_port,
                    const uip_ipaddr_t *receiver_addr,
                    uint16_t receiver_port,
                    const uint8_t *data,
                    uint16_t datalen)
{
  printf("########## UDP #########\n");
  printf("\nReceived from UDP Server: %s\n", data);
}

void connect_udp_server()
{
  uip_ip6addr(&server_addr,
              central_addr[0],
              central_addr[1],
              central_addr[2],
              central_addr[3],
              central_addr[4],
              central_addr[5],
              central_addr[6],
              central_addr[7]);
  printf("IPv6 UDP server: ");
  uip_debug_ipaddr_print(&server_addr);

  simple_udp_register(&broadcast_connection,
                        UDP_PORT_OUT,
                        &server_addr,
                        UDP_PORT_CENTRAL,
                        cb_receive_udp);
}

int ipaddr_sprintf(char *buf, uint8_t buf_len, const uip_ipaddr_t *addr)
{
  uint16_t a;
  uint8_t len = 0;
  int i, f;
  for (i = 0, f = 0; i < sizeof(uip_ipaddr_t); i += 2) {
    a = (addr->u8[i] << 8) + addr->u8[i + 1];
    if (a == 0 && f >= 0) {
      if (f++ == 0) {
        len += snprintf(&buf[len], buf_len - len, "::");
      }
    } else {
      if (f > 0) {
        f = -1;
      } else if (i > 0) {
        len += snprintf(&buf[len], buf_len - len, ":");
      }
      len += snprintf(&buf[len], buf_len - len, "%x", a);
    }
  }
  return len;
}
#!/bin/bash

# Convert a PEM file into a single line string with embedded newline escape sequences.
function one_line_pem {
    # For every non-empty line, print the line followed by a literal "\n".
    awk 'NF {printf "%s\\n", $0}' "$1"
}

# Escape special characters for safe sed replacement.
function escape_sed {
    # Escape characters like "/" and "&" so they don't interfere with sed's replacement.
    echo "$1" | sed -e 's/[\/&]/\\&/g'
}

# Generate the JSON connection profile.
# Parameters:
#   1. Organization number/index
#   2. Peer0 port
#   3. CA port
#   4. Path to the Peer TLS certificate (PEERPEM)
#   5. Path to the CA certificate (CAPEM)
function json_ccp {
    local PP=$(one_line_pem "$4")
    local CP=$(one_line_pem "$5")
    local escaped_PP=$(escape_sed "$PP")
    local escaped_CP=$(escape_sed "$CP")
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$escaped_PP#" \
        -e "s#\${CAPEM}#$escaped_CP#" \
        "$BASE_DIR/ccp-template.json"
}

# Generate the YAML connection profile.
function yaml_ccp {
    local PP=$(one_line_pem "$4")
    local CP=$(one_line_pem "$5")
    local escaped_PP=$(escape_sed "$PP")
    local escaped_CP=$(escape_sed "$CP")
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$escaped_PP#" \
        -e "s#\${CAPEM}#$escaped_CP#" \
        "$BASE_DIR/ccp-template.yaml" | sed -e $'s/\\n/\\\n          /g'
}

# Base directory for configuration templates and organizations.
BASE_DIR="organizations"
PEER_ORG_DIR="$BASE_DIR/peerOrganizations"

#############################
# Organization 1 Settings   #
#############################
ORG_NUM=1
P0PORT=7051
CAPORT=7054
ORG_DOMAIN="napier.ac.uk"
PEERPEM="$PEER_ORG_DIR/$ORG_DOMAIN/tlsca/tlsca.$ORG_DOMAIN-cert.pem"
CAPEM="$PEER_ORG_DIR/$ORG_DOMAIN/ca/ca.$ORG_DOMAIN-cert.pem"

# Generate connection profiles for Organization 1.
json_ccp $ORG_NUM $P0PORT $CAPORT "$PEERPEM" "$CAPEM" > "$PEER_ORG_DIR/$ORG_DOMAIN/connection-$ORG_DOMAIN.json"
yaml_ccp $ORG_NUM $P0PORT $CAPORT "$PEERPEM" "$CAPEM" > "$PEER_ORG_DIR/$ORG_DOMAIN/connection-$ORG_DOMAIN.yaml"

#############################
# Organization 2 Settings   #
#############################
ORG_NUM=2
P0PORT=8051
CAPORT=8054
ORG_DOMAIN="edincollege.ac.uk"
PEERPEM="$PEER_ORG_DIR/$ORG_DOMAIN/tlsca/tlsca.$ORG_DOMAIN-cert.pem"
CAPEM="$PEER_ORG_DIR/$ORG_DOMAIN/ca/ca.$ORG_DOMAIN-cert.pem"

# Generate connection profiles for Organization 2.
json_ccp $ORG_NUM $P0PORT $CAPORT "$PEERPEM" "$CAPEM" > "$PEER_ORG_DIR/$ORG_DOMAIN/connection-$ORG_DOMAIN.json"
yaml_ccp $ORG_NUM $P0PORT $CAPORT "$PEERPEM" "$CAPEM" > "$PEER_ORG_DIR/$ORG_DOMAIN/connection-$ORG_DOMAIN.yaml"

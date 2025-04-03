#!/usr/bin/env bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

#--------------------------------------------------
# Configuration for Napier
# For Napier, set ORGMSP to NapierMSP so that "mspid" becomes "NapierMSP"
ORG=napier
P0PORT=7051
CAPORT=7054
PEERPEM=organizations/peerOrganizations/napier.ac.uk/tlsca/tlsca.napier.ac.uk-cert.pem
CAPEM=organizations/peerOrganizations/napier.ac.uk/ca/ca.napier.ac.uk-cert.pem
# Replace the MSP placeholder manually inside the generated file if needed.
# One method is to post-process the file, for example:
TMPJSON=$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)
echo "${TMPJSON//Org${ORG}MSP/NapierMSP}" > organizations/peerOrganizations/napier.ac.uk/connection-napier.json

TMPYAML=$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)
echo "${TMPYAML//Org${ORG}MSP/NapierMSP}" > organizations/peerOrganizations/napier.ac.uk/connection-napier.yaml

#--------------------------------------------------
# Configuration for Edincollege
# For Edincollege, set ORGMSP to EdincollegeMSP so that "mspid" becomes "EdincollegeMSP"
ORG=edincollege
P0PORT=9051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/edincollege.ac.uk/tlsca/tlsca.edincollege.ac.uk-cert.pem
CAPEM=organizations/peerOrganizations/edincollege.ac.uk/ca/ca.edincollege.ac.uk-cert.pem
TMPJSON=$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)
echo "${TMPJSON//Org${ORG}MSP/EdincollegeMSP}" > organizations/peerOrganizations/edincollege.ac.uk/connection-edincollege.json

TMPYAML=$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)
echo "${TMPYAML//Org${ORG}MSP/EdincollegeMSP}" > organizations/peerOrganizations/edincollege.ac.uk/connection-edincollege.yaml
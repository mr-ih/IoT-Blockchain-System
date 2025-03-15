#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0




# default to using Napier
ORG=${1:-O}

# Exit on first error, print all commands.
set -e
set -o pipefail

# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

ORDERER_NAPIER_CA=${DIR}/ac-uk/organizations/ordererOrganizations/orderer.ac.uk/orderers/napier.orderer.ac.uk/tlsca/tlsca.napier.orderer.ac.uk-cert.pem
ORDERER_EDINCOLLEGE_CA=${DIR}/ac-uk/organizations/ordererOrganizations/orderer.ac.uk/orderers/edincollege.orderer.ac.uk/tlsca/tlsca.edincollege.orderer.ac.uk-cert.pem
PEER0_NAPIER_CA=${DIR}/ac-uk/organizations/peerOrganizations/napier.ac.uk/tlsca/tlsca.peer0.napier.ac.uk-cert.pem
PEER1_NAPIER_CA=${DIR}/ac-uk/organizations/peerOrganizations/napier.ac.uk/tlsca/tlsca.peer1.napier.ac.uk-cert.pem
PEER0_EDINCOLLEGE_CA=${DIR}/ac-uk/organizations/peerOrganizations/edincollege.ac.uk/tlsca/tlsca.peer0.edincollege.ac.uk-cert.pem
PEER1_EDINCOLLEGE_CA=${DIR}/ac-uk/organizations/peerOrganizations/edincollege.ac.uk/tlsca/tlsca.peer1.edincollege.ac.uk-cert.pem

if [[ ${ORG,,} == "Napier" || ${ORG,,} == "napier" ]]; then

   CORE_PEER_LOCALMSPID=NapierMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/ac-uk/organizations/peerOrganizations/napier.ac.uk/users/Admin@napier.ac.uk/msp
   CORE_PEER_ADDRESS=localhost:7051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/ac-uk/organizations/peerOrganizations/napier.ac.uk/tlsca/tlsca.peer0.napier.ac.uk-cert.pem

elif [[ ${ORG,,} == "Edincollege" || ${ORG,,} == "edincollege" ]]; then

   CORE_PEER_LOCALMSPID=EdincollegeMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/ac-uk/organizations/peerOrganizations/edincollege.ac.uk/users/Admin@edincollege.ac.uk/msp
   CORE_PEER_ADDRESS=localhost:9051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/ac-uk/organizations/peerOrganizations/edincollege.ac.uk/tlsca/tlsca.peer0.edincollege.ac.uk-cert.pem

else
   echo "Unknown \"$ORG\", please choose Napier/Napier or Edincollege/Edincollege"
   echo "For example to get the environment variables to set up a Edincollege shell environment run:  ./setOrgEnv.sh Edincollege"
   echo
   echo "This can be automated to set them as well with:"
   echo
   echo 'export $(./setOrgEnv.sh Edincollege | xargs)'
   exit 1
fi

# output the variables that need to be set
echo "CORE_PEER_TLS_ENABLED=true"
echo "ORDERER_NAPIER_CA=${ORDERER_NAPIER_CA}"
echo "ORDERER_EDINCOLLEGE_CA=${ORDERER_EDINCOLLEGE_CA}"
echo "PEER0_NAPIER_CA=${PEER0_NAPIER_CA}"
echo "PEER1_NAPIER_CA=${PEER1_NAPIER_CA}"
echo "PEER0_EDINCOLLEGE_CA=${PEER0_EDINCOLLEGE_CA}"
echo "PEER1_EDINCOLLEGE_CA=${PEER1_EDINCOLLEGE_CA}"

echo "CORE_PEER_MSPCONFIGPATH=${CORE_PEER_MSPCONFIGPATH}"
echo "CORE_PEER_ADDRESS=${CORE_PEER_ADDRESS}"
echo "CORE_PEER_TLS_ROOTCERT_FILE=${CORE_PEER_TLS_ROOTCERT_FILE}"

echo "CORE_PEER_LOCALMSPID=${CORE_PEER_LOCALMSPID}"

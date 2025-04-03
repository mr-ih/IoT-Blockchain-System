#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0




# default to using napier
ORG=${1:-napier}

# Exit on first error, print all commands.
set -e
set -o pipefail

# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

ORDERER_CA=${DIR}/ac-uk/organizations/ordererOrganizations/ac.uk/tlsca/tlsca.ac.uk-cert.pem
PEER0_NAPIER_CA=${DIR}/ac-uk/organizations/peerOrganizations/napier.ac.uk/tlsca/tlsca.napier.ac.uk-cert.pem
PEER0_EDINCOLLEGE_CA=${DIR}/ac-uk/organizations/peerOrganizations/edincollege.ac.uk/tlsca/tlsca.edincollege.ac.uk-cert.pem
PEER0_ORG3_CA=${DIR}/ac-uk/organizations/peerOrganizations/org3.ac.uk/tlsca/tlsca.org3.ac.uk-cert.pem


if [[ ${ORG,,} == "napier" || ${ORG,,} == "digibank" ]]; then

   CORE_PEER_LOCALMSPID=NapierMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/ac-uk/organizations/peerOrganizations/napier.ac.uk/users/Admin@napier.ac.uk/msp
   CORE_PEER_ADDRESS=localhost:7051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/ac-uk/organizations/peerOrganizations/napier.ac.uk/tlsca/tlsca.napier.ac.uk-cert.pem

elif [[ ${ORG,,} == "edincollege" || ${ORG,,} == "magnetocorp" ]]; then

   CORE_PEER_LOCALMSPID=EdincollegeMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/ac-uk/organizations/peerOrganizations/edincollege.ac.uk/users/Admin@edincollege.ac.uk/msp
   CORE_PEER_ADDRESS=localhost:9051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/ac-uk/organizations/peerOrganizations/edincollege.ac.uk/tlsca/tlsca.edincollege.ac.uk-cert.pem

else
   echo "Unknown \"$ORG\", please choose napier/Digibank or edincollege/Magnetocorp"
   echo "For example to get the environment variables to set upa edincollege shell environment run:  ./setOrgEnv.sh edincollege"
   echo
   echo "This can be automated to set them as well with:"
   echo
   echo 'export $(./setOrgEnv.sh edincollege | xargs)'
   exit 1
fi

# output the variables that need to be set
echo "CORE_PEER_TLS_ENABLED=true"
echo "ORDERER_CA=${ORDERER_CA}"
echo "PEER0_NAPIER_CA=${PEER0_NAPIER_CA}"
echo "PEER0_EDINCOLLEGE_CA=${PEER0_EDINCOLLEGE_CA}"
echo "PEER0_ORG3_CA=${PEER0_ORG3_CA}"

echo "CORE_PEER_MSPCONFIGPATH=${CORE_PEER_MSPCONFIGPATH}"
echo "CORE_PEER_ADDRESS=${CORE_PEER_ADDRESS}"
echo "CORE_PEER_TLS_ROOTCERT_FILE=${CORE_PEER_TLS_ROOTCERT_FILE}"

echo "CORE_PEER_LOCALMSPID=${CORE_PEER_LOCALMSPID}"

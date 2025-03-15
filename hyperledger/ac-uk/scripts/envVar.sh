#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This is a collection of bash functions used by different scripts

# imports
# test network home var targets to test-network folder
# the reason we use a var here is to accommodate scenarios
# where execution occurs from folders outside of default as $PWD, such as the test-network/addOrg3 folder.
# For setting environment variables, simple relative paths like ".." could lead to unintended references
# due to how they interact with FABRIC_CFG_PATH. It's advised to specify paths more explicitly,
# such as using "../${PWD}", to ensure that Fabric's environment variables are pointing to the correct paths.
  AC_UK_HOME=${AC_UK_HOME:-${PWD}}
  . ${AC_UK_HOME}/scripts/utils.sh

export CORE_PEER_TLS_ENABLED=true
  export ORDERER_NAPIER_CA=${AC_UK_HOME}/organizations/ordererOrganizations/orderer.ac.uk/orderers/napier.orderer.ac.uk/tlsca/tlsca.napier.orderer.ac.uk-cert.pem
  export ORDERER_EDIN_CA=${AC_UK_HOME}/organizations/ordererOrganizations/orderer.ac.uk/orderers/edincollege.orderer.ac.uk/tlsca/tlsca.edincollege.orderer.ac.uk-cert.pem
  export PEER0_NAPIER_CA=${AC_UK_HOME}/organizations/peerOrganizations/napier.ac.uk/tlsca/tlsca.napier.ac.uk-cert.pem
  export PEER1_NAPIER_CA=${AC_UK_HOME}/organizations/peerOrganizations/napier.ac.uk/tlsca/tlsca.napier.ac.uk-cert.pem
  export PEER0_EDIN_CA=${AC_UK_HOME}/organizations/peerOrganizations/edincollege.ac.uk/tlsca/tlsca.edincollege.ac.uk-cert.pem
  export PEER1_EDIN_CA=${AC_UK_HOME}/organizations/peerOrganizations/edincollege.ac.uk/tlsca/tlsca.edincollege.ac.uk-cert.pem

# Set environment variables for the peer org
setGlobals() {
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  infoln "Using organization ${USING_ORG}"
  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_LOCALMSPID=NapierMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_NAPIER_CA
    export CORE_PEER_MSPCONFIGPATH=${AC_UK_HOME}/organizations/peerOrganizations/napier.ac.uk/users/Admin@napier.ac.uk/msp
    export CORE_PEER_ADDRESS=peer0.napier.ac.uk:7051
  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_LOCALMSPID=EdinCollegeMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_EDIN_CA
    export CORE_PEER_MSPCONFIGPATH=${AC_UK_HOME}/organizations/peerOrganizations/edincollege.ac.uk/users/Admin@edincollege.ac.uk/msp
    export CORE_PEER_ADDRESS=peer0.edincollege.ac.uk:9051
  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" = "true" ]; then
    env | grep CORE
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {
  PEER_CONN_PARMS=()
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    if [ $1 -eq 1 ]; then
      PEER="peer0.napier.ac.uk"
    elif [ $1 -eq 2 ]; then
      PEER="peer0.edincollege.ac.uk"
    fi

    ## Set peer addresses
    if [ -z "$PEERS" ]
    then
	PEERS="$PEER"
    else
	PEERS="$PEERS $PEER"
    fi
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" --peerAddresses $CORE_PEER_ADDRESS)
    ## Set path to TLS certificate
    CA=PEER0_${USING_ORG}_CA
    TLSINFO=(--tlsRootCertFiles "${!CA}")
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" "${TLSINFO[@]}")
    # shift by one to get to the next organization
    shift
  done
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}

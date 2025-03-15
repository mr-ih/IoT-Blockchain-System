#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

# import utils
# test network home var targets to test network folder
# the reason we use a var here is considering with org3 specific folder
# when invoking this for org3 as test-network/scripts/org3-scripts
# the value is changed from default as $PWD(test-network)
# to .. as relative path to make the import works
AC_UK_HOME=${AC_UK_HOME:-${PWD}}
. ${AC_UK_HOME}/scripts/configUpdate.sh


# NOTE: This requires jq and configtxlator for execution.
createAnchorPeerUpdate() {
  infoln "Fetching channel config for channel $CHANNEL_NAME"
  fetchChannelConfig $ORG $CHANNEL_NAME ${AC_UK_HOME}/channel-artifacts/${CORE_PEER_LOCALMSPID}config.json

  infoln "Generating anchor peer update transaction for Org${ORG} on channel $CHANNEL_NAME"

  if [ $ORG -eq 1 ]; then
    HOST="peer0.napier.ac.uk"
    PORT=7051
  elif [ $ORG -eq 2 ]; then
    HOST="peer0.napier.ac.uk"
    PORT=7052
  elif [ $ORG -eq 3 ]; then
    HOST="peer0.edincollege.ac.uk"
    PORT=8051
  elif [ $ORG -eq 4 ]; then
    HOST="peer1.edincollege.ac.uk"
    PORT=8052
  else
    errorln "Org${ORG} unknown"
  fi

  set -x
  # Modify the configuration to append the anchor peer
  jq '.channel_group.groups.Application.groups.'${CORE_PEER_LOCALMSPID}'.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "'$HOST'","port": '$PORT'}]},"version": "0"}}' ${AC_UK_HOME}/channel-artifacts/${CORE_PEER_LOCALMSPID}config.json > ${AC_UK_HOME}/channel-artifacts/${CORE_PEER_LOCALMSPID}modified_config.json
  res=$?
  { set +x; } 2>/dev/null
  verifyResult $res "Channel configuration update for anchor peer failed, make sure you have jq installed"


  # Compute a config update, based on the differences between
  # {orgmsp}config.json and {orgmsp}modified_config.json, write
  # it as a transaction to {orgmsp}anchors.tx
  createConfigUpdate ${CHANNEL_NAME} ${AC_UK_HOME}/channel-artifacts/${CORE_PEER_LOCALMSPID}config.json ${AC_UK_HOME}/channel-artifacts/${CORE_PEER_LOCALMSPID}modified_config.json ${AC_UK_HOME}/channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx
}

updateAnchorPeer() {
  peer channel update -o localhost:7050 --ordererTLSHostnameOverride napier.orderer.ac.uk -c $CHANNEL_NAME -f ${AC_UK_HOME}/channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile "$ORDERER_CA" >&log.txt
  peer channel update -o localhost:7050 --ordererTLSHostnameOverride edincollege.orderer.ac.uk -c $CHANNEL_NAME -f ${AC_UK_HOME}/channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile "$ORDERER_CA" >&log.txt

  res=$?
  cat log.txt
  verifyResult $res "Anchor peer update failed"
  successln "Anchor peer set for org '$CORE_PEER_LOCALMSPID' on channel '$CHANNEL_NAME'"
}

ORG=$1
CHANNEL_NAME=$2

setGlobals $ORG

createAnchorPeerUpdate

updateAnchorPeer

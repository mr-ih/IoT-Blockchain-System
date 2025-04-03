// Import dependencies from the Hyperledger Fabric Node.js SDK and Node.js modules
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

class FabricClient {
  constructor() {
    try {
      // Define the network connection profile path
      const connectionProfilePath = path.resolve(
        __dirname,
        '/home/ibrahimh/iot-blockchain-system/hyperledger/ac-uk/organizations/peerOrganizations/napier.ac.uk/connection-napier.ac.uk.json'
      );

      // Load the network connection profile
      this.connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

      // Define other class properties clearly
      this.walletPath = path.resolve(__dirname, '/home/ibrahimh/iot-blockchain-system/hyperledger/ac-uk/wallet');
      this.channelName = 'mychannel';
      this.chaincodeName = 'sensor_chaincode';
      this.identity = 'Admin@napier.ac.uk';
    } catch (error) {
      console.error('Error initializing FabricClient:', error);
      throw error;
    }
  }

  /**
   * Submits sensor data to the blockchain network.
   *
   * @param {Object} sensorData - The sensor data JSON object to send.
   */
  async submitSensorData(sensorData) {
    const gateway = new Gateway();
    try {
      // Load wallet from the file system
      const wallet = await Wallets.newFileSystemWallet(this.walletPath);
      // Check if the admin identity exists in wallet
      const identity = await wallet.get(this.identity);
      if (!identity) {
        throw new Error(`An identity for the user ${this.identity} does not exist in the wallet.`);
      }

      // Connect to the gateway using the connection profile,
      // wallet and identity along with gateway discovery settings.
      await gateway.connect(this.connectionProfile, {
        wallet,
        identity: this.identity,
        discovery: { enabled: true, asLocalhost: true }
      });

      // Get the network channel (mychannel) and contract (sensor_chaincode)
      const network = await gateway.getNetwork(this.channelName);
      const contract = network.getContract(this.chaincodeName);

      // Submit the transaction 'CreateSensorEvent' with sensorData as a JSON string
      console.log('Submitting transaction CreateSensorEvent with sensorData:', sensorData);
      const result = await contract.submitTransaction('CreateSensorEvent', JSON.stringify(sensorData));
      
      console.log('Transaction has been submitted successfully. Result:', result.toString());
      return result.toString();
    } catch (error) {
      console.error('Error in submitSensorData:', error);
      throw error;
    } finally {
      // Disconnect from the gateway gracefully
      gateway.disconnect();
    }
  }
}

module.exports = FabricClient;

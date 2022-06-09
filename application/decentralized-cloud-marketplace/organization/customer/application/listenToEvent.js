/*
 * Author: Jean-Marc Saad
 * Project: University of Amsterdam - Master's Project 2022
 * Host: KPMG Digital Enablement
 * Academic Supervisor: Dr. Zhiming Zhao
 *
 * SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to issue commercial paper
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
const Auction = require('../contract/lib/auction/auction.js');

// Main program function
async function main() {

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('../identity/user/customer_1/wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        // const userName = 'customer_1.issuer@magnetocorp.com';
        const userName = 'customer_1';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org1.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled:true, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access PaperNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to auction contract
        console.log('Use org.awesome.auction smart contract.');

        const contract = await network.getContract('awesomecontract');

        console.log("deb00g");
        const listener = await contract.addContractListener('my-contract-listener', 'StartProvisioningEvent', (err, blockNumber, chaincodeEvents) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Processing chaincode events in block number: ${blockNumber}`);
            for (const chaincodeEvent of chaincodeEvents) {
                const {chaincodeId, transactionId, status, eventName, payload} = chaincodeEvent;
                console.log(`Block Number:${blockNumber} EventName:${eventName} Transaction ID:${transactionId} Status:${status}`);
            }
        })

        // const listener = await contract.addContractListener('my-contract-listener', 'StartProvisioningEvent', (err, event, blockNumber, transactionId, status) => {
        //     if (err) {
        //         console.log("err - deb00g")
        //         console.error(err);
        //         return;
        //     }
        //     console.log(`Block Number: ${blockNumber} Transaction ID: ${transactionId} Status: ${status}`);
        // })
        console.log("deb00g");

        // const signAuctionTransaction = {
        //     name: "sign",
        //     args: [
        //         userName,
        //         '00001',
        //         true
        //     ]
        // }

        // const signResponse = await contract.submitTransaction(signAuctionTransaction.name, ...signAuctionTransaction.args);
        // // const signResponse = await contract.submitTransaction('sign', userName, '00001', true);

        // // process response
        // console.log('Process issue transaction response.'+signResponse);

        // let auction = Auction.fromBuffer(signResponse);
        // console.log(`${auction.creator} auction : ${auction.auctionNumber} successfully signed by customer ${auction.customer}`);

        // console.log('Transaction complete.');

    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

    }
}
main().then(() => {

    console.log('Issue program complete.');

}).catch((e) => {

    console.log('Issue program exception.');
    console.log(e);
    console.log(e.stack);
    // process.exit(-1);

});

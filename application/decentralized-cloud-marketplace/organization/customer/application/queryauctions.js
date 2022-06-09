/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to query the ledger
 * 5. Evaluate transactions (queries)
 * 6. Process responses
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');


// Main program function
async function main() {

    // Specify userName for network access
    const userName = 'customer_1';

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet(`../identity/user/${userName}/wallet`);


    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org1.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true }

        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access PaperNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to commercial paper contract
        console.log('Use org.awesome.auction smart contract.');

        const contract = await network.getContract('awesomecontract', 'org.awesome.auction');

        // queries - commercial paper
        console.log('-----------------------------------------------------------------------------------------');
        console.log('****** Submitting auction queries ****** \n\n ');


        // 1 asset history
        // console.log('1. Query Auction History....');
        // console.log('-----------------------------------------------------------------------------------------\n');
        // let queryResponse = await contract.evaluateTransaction('queryAuctionHistory', userName, '00001');

        // let json = JSON.parse(queryResponse.toString());
        // console.log(json);
        // console.log('\n\n');
        // console.log('\n  History query complete.');
        // console.log('-----------------------------------------------------------------------------------------\n\n');

        // 2 ownership query
        console.log(`1. Query Auction Ownership.... Auctions owned by Customer \'${userName}\'`);
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse2 = await contract.evaluateTransaction('queryAuctionsByCreator', userName);
        let json = JSON.parse(queryResponse2.toString());
        console.log(json);

        console.log('\n\n');
        console.log('\n  Auction Ownership query complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');

        // 3 partial key query
        // console.log(`3. Query Auction Partial Key.... Auctions in org.awesome.auction namespace and prefixed ${userName}`);
        // console.log('-----------------------------------------------------------------------------------------\n');
        // let queryResponse3 = await contract.evaluateTransaction('queryAuctionPartial', userName);

        // json = JSON.parse(queryResponse3.toString());
        // console.log(json);
        // console.log('\n\n');

        // console.log('\n  Partial Key query complete.');
        // console.log('-----------------------------------------------------------------------------------------\n\n');


        // // 4 Named query - all redeemed papers
        // console.log('4. Named Query: ... All papers in org.papernet.papers that are in current state of redeemed');
        // console.log('-----------------------------------------------------------------------------------------\n');
        // let queryResponse4 = await contract.evaluateTransaction('queryAuctionNamed', 'redeemed');

        // json = JSON.parse(queryResponse4.toString());
        // console.log(json);
        // console.log('\n\n');

        // console.log('\n  Named query "redeemed" complete.');
        // console.log('-----------------------------------------------------------------------------------------\n\n');


        // // 5 named query - by value
        // console.log('5. Named Query:.... All papers in org.papernet.papers with faceValue > 4000000');
        // console.log('-----------------------------------------------------------------------------------------\n');
        // let queryResponse5 = await contract.evaluateTransaction('queryAuctionNamed', 'value');

        // json = JSON.parse(queryResponse5.toString());
        // console.log(json);
        // console.log('\n\n');

        // console.log('\n  Named query by "value" complete.');
        // console.log('-----------------------------------------------------------------------------------------\n\n');
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

    console.log('Queryapp program complete.');

}).catch((e) => {

    console.log('Queryapp program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
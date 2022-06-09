/*
 * Author: Jean-Marc Saad
 * Project: University of Amsterdam - Master's Project 2022
 * Host: KPMG Digital Enablement
 * Academic Supervisor: Dr. Zhiming Zhao
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// Auction specifc classes
const Auction = require('./auction.js');
const AuctionList = require('./auctionlist.js');
const QueryUtils = require('../queries.js');
const ResourceContract = require('../resource/resourcecontract.js');
const ResourceList = require('../resource/resourcelist.js');

/**
 * A custom context provides easy access to list of all auctions
 */
class AuctionContext extends Context {

    constructor() {
        super();
        // All auctions are held in a list of auctions
        this.auctionList = new AuctionList(this);
        this.resourceList = new ResourceList(this);
    }

}

/**
 * Define auction smart contract by extending Fabric Contract class
 *
 */
class AuctionContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.awesome.auction');
    }

    /**
     * Define a custom context for auction
    */
    createContext() {
        return new AuctionContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Create a new auction
     *
     * @param {Context} ctx the transaction context
     * @param {String} creator auction creator
     * @param {Integer} auctionNumber auction number
     * @param {String} provider cloud provider linked to auction
     * @param {String} customer customer linked to auction
     * @param {String} auctionStartDateTime auction start date
     * @param {Integer} duration auction duration in hours
     * @param {Integer} minimumBid auction minimum bid in USD
     * @param {Boolean} isMonitored flag to determine whether auction will be monitored by witnesses
     * @param {Object} resourceConfiguration config object describing desired resource 
     * @param {Object} slaConfiguration config object describing SLOs 
    */
    async createAuction(ctx, creator, auctionNumber, provider, customer, auctionStartDateTime, duration, minimumBid, isMonitored, resourceConfiguration, slaConfiguration) {

        // create an instance of the auction
        let auction = Auction.createInstance(creator, auctionNumber, provider, customer, auctionStartDateTime, duration, minimumBid, isMonitored, resourceConfiguration, slaConfiguration);
        // .createInstance(issuer, paperNumber, issueDateTime, maturityDateTime, parseInt(faceValue));

        // Smart contract moves auction into ACTIVE state
        auction.setActive()

        // save the owner's MSP 
        let mspid = ctx.clientIdentity.getMSPID();
        auction.setOwnerMSP(mspid);

        // Newly created auctions are owned by the creator to begin with (recorded for reporting purposes)
        auction.setOwner(creator);

        // Add the auction to the list of auction in the ledger world state
        await ctx.auctionList.addAuction(auction);

        // Must return a serialized auction to caller of smart contract
        return auction;
    }

    async sign(ctx, creator, auctionNumber, isMonitored) {
        let auctionKey = Auction.makeKey([creator, auctionNumber]);
        let auction = await ctx.auctionList.getAuction(auctionKey);

        // Owner Check
        // Fail if not owner of Auction

        auction.setAgreed();

        // Update the auction
        await ctx.auctionList.updateAuction(auction);

        // Logic
        // 1. Create Resource by Invoking Resource Contract
        // 2. Transfer Ownership of Resource to Customer

        // 3. [EVENT] Start Resource Provisioning
        //   a. Change Resource state to Provisioning
        //   b. 
        
        console.log("DEBUGGING");

        let resourceContract = new ResourceContract();
        const resource = await resourceContract.createResource(ctx, auction.getProvider(), auction.getCustomer(), "VM", isMonitored, auction.getResourceConfiguration(), {})

        return auction;
    }


    // Query transactions

    /**
     * Query history of a auction
     * @param {Context} ctx the transaction context
     * @param {String} creator auction creator
     * @param {Integer} auctionNumber auction number for this creator
    */
     async queryAuctionHistory(ctx, creator, auctionNumber) {
        // Get a key to be used for History query

        let query = new QueryUtils(ctx, 'org.awesome.auction');
        let results = await query.getAssetHistory(creator, auctionNumber); // (cpKey);
        return results;
    }

    /**
    * queryOwner auction: supply name of owning org, to find list of auctions based on owner field
    * @param {Context} ctx the transaction context
    * @param {String} owner auction owner
    */
    async queryAuctionOwner(ctx, owner) {

        let query = new QueryUtils(ctx, 'org.awesome.auction');
        let owner_results = await query.queryKeyByOwner(owner);

        return owner_results;
    }

    /**
    * queryPartial auction - provide a prefix eg. "DigiBank" will list all auctions _issued_ by DigiBank etc etc
    * @param {Context} ctx the transaction context
    * @param {String} prefix asset class prefix (added to auctionlist namespace) eg. org.awesome.auctionMagnetoCorp asset listing: auctions issued by MagnetoCorp.
    */
    async queryAuctionPartial(ctx, prefix) {

        let query = new QueryUtils(ctx, 'org.awesome.auction');
        let partial_results = await query.queryKeyByPartial(prefix);

        return partial_results;
    }

    /**
    * queryAdHoc auction - supply a custom mango query
    * eg - as supplied as a param:     
    * ex1:  ["{\"selector\":{\"faceValue\":{\"$lt\":8000000}}}"]
    * ex2:  ["{\"selector\":{\"faceValue\":{\"$gt\":4999999}}}"]
    * 
    * @param {Context} ctx the transaction context
    * @param {String} queryString querystring
    */
    async queryAuctionAdhoc(ctx, queryString) {

        let query = new QueryUtils(ctx, 'org.awesome.auction');
        let querySelector = JSON.parse(queryString);
        let adhoc_results = await query.queryByAdhoc(querySelector);

        return adhoc_results;
    }
}

module.exports = AuctionContract;

/*
 * Author: Jean-Marc Saad
 * Project: University of Amsterdam - Master's Project 2022
 * Host: KPMG Digital Enablement
 * Academic Supervisor: Dr. Zhiming Zhao
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract, Context } = require('fabric-contract-api');
const Auction = require('../auction/auction.js');
const AuctionList = require('../auction/auctionlist.js');
const Resource = require('../resource/resource.js');
const ResourceList = require('../resource/resourcelist.js');
const QueryUtils = require('../queries.js');

class AwesomeContext extends Context {
    constructor() {
        super();
        this.auctionList = new AuctionList(this);
        this.resourceList = new ResourceList(this);
    }
}

class AuctionContract extends Contract {
    constructor() {
        super('org.awesome.auction');
    }

    createContext() {
        return new AwesomeContext();
    }

    async createAuction(ctx, creator, auctionNumber, provider, customer, auctionStartDateTime, duration, minimumBid, isMonitored, resourceConfiguration, slaConfiguration) {
        let auction = Auction.createInstance(creator, auctionNumber, provider, customer, auctionStartDateTime, duration, minimumBid, isMonitored, resourceConfiguration, slaConfiguration);
        auction.setActive()

        let mspid = ctx.clientIdentity.getMSPID();
        auction.setOwnerMSP(mspid);
        auction.setOwner(creator);

        await ctx.auctionList.addAuction(auction);
        return auction;
    }

    async sign(ctx, creator, auctionNumber, isMonitored) {
        let auctionKey = Auction.makeKey([creator, auctionNumber]);
        let auction = await ctx.auctionList.getAuction(auctionKey);

        auction.setAgreed();
        await ctx.auctionList.updateAuction(auction);

        let resourceContract = new ResourceContract();
        // let resourceNumber = (ctx.resourceList.length + 1).toString().padStart(5, '0');
        const resource = await resourceContract.createResource(ctx, auction.getProvider(), auctionNumber, auction.getCustomer(), "VM", isMonitored, auction.getResourceConfiguration(), {})

        let startProvisioningEvent = {
            type: "Start Provisioning",
            owner: auction.getCustomer(),
            creator: auction.getProvider(),
            id: auctionNumber,
        };
        await ctx.stub.setEvent('StartProvisioningEvent', Buffer.from(JSON.stringify(startProvisioningEvent)));

        return auction;
    }

    async queryAuctionsByCreator(ctx, creator) {
        let query = new QueryUtils(ctx, 'org.awesome.auction');
        let creator_results = await query.queryKeyByPartial(creator);
        return creator_results;
    }
}


class ResourceContract extends Contract {
    constructor() {
        super('org.awesome.resource');
    }

    createContext() {
        return new AwesomeContext();
    }

    async createResource(ctx, creator, resourceNumber, customer, type, isMonitored, resourceConfiguration, connectionConfiguration) {
        let resource = Resource.createInstance(creator, resourceNumber, customer, type, isMonitored, resourceConfiguration, connectionConfiguration);

        resource.setNotProvisioned();
        // let mspid = ctx.clientIdentity.getMSPID();
        // resource.setOwnerMSP(mspid);
        // resource.setOwnerMSP(mspid);
        resource.setOwner(customer);

        await ctx.resourceList.addResource(resource);
        return resource;
    }

    async provisionResource(ctx, creator, resourceNumber, connectionDetails) {
        let resourceKey = Resource.makeKey([creator, resourceNumber]);
        let resource = await ctx.resourceList.getResource(resourceKey);

        resource.setProvisioned();
        // Create PrivateData for Customer containing connectionDetails
        // Raise Event to Alert Witnesses to start monitoring
        let resourceProvisionedEvent = {
            type: "Resource Provisioned",
            owner: auction.getCustomer(),
            creator: auction.getProvider(),
            id: auctionNumber,
        };
        await ctx.stub.setEvent('ResourceProvisionedEvent', Buffer.from(JSON.stringify(provisioningEvent)));

    }

    async queryResourcesByCreator(ctx, creator) {
        let query = new QueryUtils(ctx, 'org.awesome.resource');
        let creator_results = await query.queryKeyByPartial(creator);
        return creator_results;
    }
}

module.exports = [AuctionContract, ResourceContract]
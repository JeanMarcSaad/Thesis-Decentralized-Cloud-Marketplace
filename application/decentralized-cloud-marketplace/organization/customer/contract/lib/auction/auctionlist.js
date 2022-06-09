/*
 * Author: Jean-Marc Saad
 * Project: University of Amsterdam - Master's Project 2022
 * Host: KPMG Digital Enablement
 * Academic Supervisor: Dr. Zhiming Zhao
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./../../ledger-api/statelist.js');

const Auction = require('./auction.js');

class AuctionList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.awesome.auction');
        this.use(Auction);
    }

    async addAuction(auction) {
        return this.addState(auction);
    }

    async getAuction(auctionKey) {
        return this.getState(auctionKey);
    }

    async updateAuction(auction) {
        return this.updateState(auction);
    }
}


module.exports = AuctionList;

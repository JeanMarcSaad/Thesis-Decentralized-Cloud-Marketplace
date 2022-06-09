/*
 * Author: Jean-Marc Saad
 * Project: University of Amsterdam - Master's Project 2022
 * Host: KPMG Digital Enablement
 * Academic Supervisor: Dr. Zhiming Zhao
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('./../../ledger-api/state.js');

const auctionState = {
    INACTIVE: 1,
    ACTIVE: 2,
    PENDING_AGREEMENT: 3,
    AGREED: 4
};

class Auction extends State {

    constructor(obj) {
        super(Auction.getClass(), [obj.creator, obj.auctionNumber]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */
    getCreator() {
        return this.creator;
    }

    setCreator(newCreator) {
        this.creator = newCreator;
    }

    getOwner() {
        return this.owner;
    }

    setOwnerMSP(mspid) {
        this.mspid = mspid;
    }

    getOwnerMSP() {
        return this.mspid;
    }

    setOwner(newOwner) {
        this.owner = newOwner;
    }

    /**
     * Auction Info getters and setters
    */
    getProvider() {
        return this.provider;
    }

    getCustomer() {
        return this.customer;
    }

    getResourceConfiguration() {
        return this.resourceConfiguration;
    }

    /**
     * Useful methods to encapsulate auction states
     */
    setActive() {
        this.currentState = auctionState.ACTIVE;
    }

    setInactive() {
        this.currentState = auctionState.INACTIVE;
    }

    setPendingAgreement() {
        this.currentState = auctionState.PENDING_AGREEMENT;
    }

    setAgreed() {
        this.currentState = auctionState.AGREED;
    }

    isActive() {
        return this.currentState === auctionState.ACTIVE;
    }

    isInactive() {
        return this.currentState === auctionState.INACTIVE;
    }

    isPendingAgreement() {
        return this.currentState === auctionState.PENDING_AGREEMENT;
    }

    isAgreed() {
        return this.currentState === auctionState.AGREED;
    }

    static fromBuffer(buffer) {
        return Auction.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to auction
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Auction);
    }

    /**
     * Factory method to create an auction object
     */
    static createInstance(creator, auctionNumber, provider, customer, auctionStartDateTime, duration, minimumBid, isMonitored, resourceConfiguration, slaConfiguration) {
        return new Auction({ creator, auctionNumber, provider, customer, auctionStartDateTime, duration, minimumBid, isMonitored, resourceConfiguration, slaConfiguration });
    }

    static getClass() {
        return 'org.awesome.auction';
    }
}

module.exports = Auction;

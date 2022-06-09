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

const resourceState = {
    NOT_PROVISIONED: 1,
    PROVISIONING: 2,
    PROVISIONED: 3,
    ERROR_PROVISIONING: 4
};

class Resource extends State {

    constructor(obj) {
        super(Resource.getClass(), [obj.creator, obj.resourceNumber]);
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
     * Useful methods to encapsulate resource states
     */
    setNotProvisioned() {
        this.currentState = resourceState.NOT_PROVISIONED;
    }

    setProvisioning() {
        this.currentState = resourceState.PROVISIONING;
    }

    setProvisioned() {
        this.currentState = resourceState.PROVISIONED;
    }

    setErrorProvisioning() {
        this.currentState = resourceState.ERROR_PROVISIONING;
    }

    isNotProvisioned() {
        return this.currentState === resourceState.NOT_PROVISIONED;
    }

    isProvisioning() {
        return this.currentState === resourceState.PROVISIONING;
    }

    isProvisioned() {
        return this.currentState === resourceState.PROVISIONED;
    }

    isErrorProvisioned() {
        return this.currentState === resourceState.ERROR_PROVISIONING;
    }

    static fromBuffer(buffer) {
        return Resource.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to resource
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Resource);
    }

    /**
     * Factory method to create an resource object
     */
    static createInstance(creator, resourceNumber, customer, type, isMonitored, resourceConfiguration, connectionConfiguration) {
        return new Resource({ creator, resourceNumber, customer, type, isMonitored, resourceConfiguration, connectionConfiguration });
    }

    static getClass() {
        return 'org.awesome.resource';
    }
}

module.exports = Resource;

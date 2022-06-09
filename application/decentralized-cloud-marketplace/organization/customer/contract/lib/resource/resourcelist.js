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

const Resource = require('./resource.js');

class ResourceList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.awesome.resource');
        this.use(Resource);
    }

    async addResource(resource) {
        return this.addState(resource);
    }

    async getResource(resourceKey) {
        return this.getState(resourceKey);
    }

    async updateResource(resource) {
        return this.updateState(resource);
    }
}


module.exports = ResourceList;

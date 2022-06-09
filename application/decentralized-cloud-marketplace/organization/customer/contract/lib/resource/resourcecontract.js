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
const Resource = require('./resource.js');
const ResourceList = require('./resourcelist.js');
const QueryUtils = require('../queries.js');

/**
 * A custom context provides easy access to list of all resources
 */
class ResourceContext extends Context {

    constructor() {
        super();
        // All resources are held in a list of resources
        this.resourceList = new ResourceList(this);
    }

}

/**
 * Define resource smart contract by extending Fabric Contract class
 *
 */
class ResourceContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.awesome.resource');
    }

    /**
     * Define a custom context for resource
    */
    createContext() {
        return new ResourceContext();
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
     * Create a resource
     *
     * @param {Context} ctx the transaction context
     * @param {String} creator resource creator
     * @param {Integer} resourceNumber resource number
     * @param {String} customer customer linked to resource
     * @param {String} type resource type
     * @param {Boolean} isMonitored flag to determine whether resource will be monitored by witnesses
     * @param {Object} resourceConfiguration config object describing desired resource 
     * @param {Object} connectionConfiguration config object describing connection settings to the resource 
    */
    async createResource(ctx, creator, customer, type, isMonitored, resourceConfiguration, connectionConfiguration) {

        // create an instance of the resource
        let resource = Resource.createInstance(creator, customer, type, isMonitored, resourceConfiguration, connectionConfiguration);

        // Smart contract moves resource into ACTIVE state
        resource.setNotProvisioned()

        // save the owner's MSP 
        // let mspid = ctx.clientIdentity.getMSPID();
        // resource.setOwnerMSP(mspid);

        // Newly created resources are owned by the creator to begin with (recorded for reporting purposes)
        resource.setOwner(customer);

        // Add the resource to the list of resource in the ledger world state
        await ctx.resourceList.addResource(resource);

        // Must return a serialized resource to caller of smart contract
        return resource;
    }

    // Query transactions

    /**
     * Query history of a resource
     * @param {Context} ctx the transaction context
     * @param {String} creator resource creator
     * @param {Integer} resourceNumber resource number for this creator
    */
     async queryResourceHistory(ctx, creator, resourceNumber) {
        // Get a key to be used for History query

        let query = new QueryUtils(ctx, 'org.awesome.resource');
        let results = await query.getAssetHistory(creator, resourceNumber); // (cpKey);
        return results;
    }

    /**
    * queryOwner resource: supply name of owning org, to find list of resources based on owner field
    * @param {Context} ctx the transaction context
    * @param {String} owner resource owner
    */
    async queryResourceOwner(ctx, owner) {

        let query = new QueryUtils(ctx, 'org.awesome.resource');
        let owner_results = await query.queryKeyByOwner(owner);

        return owner_results;
    }

    /**
    * queryPartial resource - provide a prefix eg. "DigiBank" will list all resources _issued_ by DigiBank etc etc
    * @param {Context} ctx the transaction context
    * @param {String} prefix asset class prefix (added to resourcelist namespace) eg. org.awesome.resourceMagnetoCorp asset listing: resources issued by MagnetoCorp.
    */
    async queryResourcePartial(ctx, prefix) {

        let query = new QueryUtils(ctx, 'org.awesome.resource');
        let partial_results = await query.queryKeyByPartial(prefix);

        return partial_results;
    }

    /**
    * queryAdHoc resource - supply a custom mango query
    * eg - as supplied as a param:     
    * ex1:  ["{\"selector\":{\"faceValue\":{\"$lt\":8000000}}}"]
    * ex2:  ["{\"selector\":{\"faceValue\":{\"$gt\":4999999}}}"]
    * 
    * @param {Context} ctx the transaction context
    * @param {String} queryString querystring
    */
    async queryResourceAdhoc(ctx, queryString) {

        let query = new QueryUtils(ctx, 'org.awesome.resource');
        let querySelector = JSON.parse(queryString);
        let adhoc_results = await query.queryByAdhoc(querySelector);

        return adhoc_results;
    }
}

module.exports = ResourceContract;

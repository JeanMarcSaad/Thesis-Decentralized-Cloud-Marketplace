# Decentralized Cloud Service Marketplace
# Overview

# Installation
## Dependencies
- Python3
- Ansible (2.8)

## Installation Steps


# Architecture

# Implementation Left To-Do
- Event Handler Application to keep listening for events/react with provisioning
- Multi-node deployment + Automatically connect new nodes (provider/customer/witness)
- Finish Python Tool for provisioning (with plugin structure)
- Package application as a **tool** that provider can just run to connect to Network, and automatically have access to provisioning tool
    - yaml connection file to fabric network should be a template (jinja2)
    - provisioning tool should be packaged inside tool as node app OR CLI tool

## Flow
1. Customer_1 Connects
2. Provider_1 Connects
3. Customer_1 creates Auction_1
4. Provider_1 wins auction (Assumed)
5. Auction_1 is signed (By both or by Provider alone, tbd)
6. Provider_1 app is alerted by Event to start provisioning
7. Python tool is called to start provisioning
    - Connect to Provider Infra using **private key management**
    - Plugin variable is set, *example: AWS*
    - Interface calls provisionVM() => Specific AWS Implementation is called
    - AWS Implementation interfaces with AWS API, can be custom
8. When done, start new TX to update resource to provisioned + public connection data + create private connection data for Customer
9. Event is raised to alert Witnesses to start monitoring
10. Witness monitoring flow (Will not be implemented, is completely theorized)
    - Periodically query infra and store in Private Witness Data through TX
    - Periodically, Provider/Customer sign TX to ask Witnesses to provided compliance status
    - Witnesses then query Private Data (Is Available > x % of time in last y time)
    - All witnesses sign, majority answer is committed to blockchain

## Out of Scope
- Witness monitoring (Maybe)

# Technical Debt
- Add Automatic Number Increments for Auctions/Resources
- Implement Consensus (On Auction Signing)
- Write Ansible Docker Installation Role
- Resource.js --> Change Creator to Provider


<!--  -->
- Research Fault Tolerance (+ Other implementation contributions done by my project)

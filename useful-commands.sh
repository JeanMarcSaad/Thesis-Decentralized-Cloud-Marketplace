# Fix Line Endings
find . -name "*.sh" -exec chmod +x {} \;
find . -name "*.sh" -exec sed -i -e 's/\r$//' {} \;

# Add Fabric Binaries to PATH
export PATH=$PWD/../bin:$PATH

# Give Execute Permission to Fabric Binaries
chmod +x ./../bin/*

# Change Mode of Directory Recursively
## test-network work dir
# sudo chmod -R ugo+rwx organizations
sudo chmod -R ugo+rwx ./../test-network/organizations

# Chaincode Deployment
# As Organization 1
cd organization/customer
## 1. Use Org 1 Env
source customer.sh
## 2. Create Chaincode Package
peer lifecycle chaincode package awesome.tar.gz --lang node --path ./contract --label awesome_0
## 3. [Admin] Install Chaincode on Peers
peer lifecycle chaincode install awesome.tar.gz
## 4. Check Package ID of Chaincode we installed
peer lifecycle chaincode queryinstalled
export PACKAGE_ID=awesome_0:82fba1b95f6dc392896772c54d3fbab522cb3b91535b61903212d7247ff6de72
## 5. [Admin] Approve Chaincode Definition
peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name awesomecontract -v 0 --package-id $PACKAGE_ID --sequence 4 --tls --cafile $ORDERER_CA

# Repeat for Organization 2
## 1. Use Org 2 Env
source ../provider/provider.sh
## 2-5 Repeat

# Deploy Chaincode on Channel (Majority has approved Code)
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --peerAddresses localhost:7051 --tlsRootCertFiles ${PEER0_ORG1_CA} --peerAddresses localhost:9051 --tlsRootCertFiles ${PEER0_ORG2_CA} --channelID mychannel --name awesomecontract -v 0 --sequence 4 --tls --cafile $ORDERER_CA --waitForEvent

peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --peerAddresses localhost:7051 --tlsRootCertFiles ${PEER0_ORG1_CA} --peerAddresses localhost:9051 --tlsRootCertFiles ${PEER0_ORG2_CA} --channelID mychannel --signature-policy "AND('Org1.member', 'Org2.member')" --name awesomecontract -v 0 --sequence 4 --tls --cafile $ORDERER_CA --waitForEvent


# Installing Customer Application
cd application
## Install JS Application Dependencies
npm install
## Create User Wallet [Customer]
node addToWallet.js
## Create Auction [Customer]
node createAuction.js

# Other Methods to interface with Auction Contract
node queryauctions.js
node signAuction.js
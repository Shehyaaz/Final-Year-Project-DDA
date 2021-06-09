# Decentralised Domain Authentication
This repository contains the implementation of Decentralised Domain Authentication, done as part of the Final Year Project during 2020-21.

#### About the system
Decentralised Domain Authentication is a system for detecting and automatically responding to Domain misbehavior with smart contracts on Ethereum Blockchain. This provides an approach for enhancing the security of TLS handshake authentication protocols. In general, DDA system extends the traditional TLS ecosystem where domains interact with clients by carrying out TLS handshake with Ethereum blockchain.


#### Technologies and Packages used
* NodeJS v14.16.0
* Truffle v5.3.9
* Express v4.17.1
* ReactJS v16.11.0 
* PKIjs v2.1.95
* OCSP v1.2.0
* Ganache CLI v6.12.2 
* Solidity v0.6.0

#### Steps to run this project
1. Ensure ganache-cli and truffle are globally installed in your system.
2. cd into the project folder and run `npm i`.
3. cd into client folder and run `npm i`.
4. Run ganache local blockchain using `ganache-cli` command.
5. Open a new terminal and run `truffle migrate --reset`.
6. To start the server, run `node ./server/server.js`
    * To run the server in the background, run:
        * `start-job -scriptblock{node .\server\server.js}` on Windows Powershell 7.1.3.
        * `node ./server/server.js` on Linux based machines. 
7. To execute the front-end, run `cd client && npm start`.

#### Authors
1. Mohammed Sufiyan Aman
2. Riyanchhi Agrawal
3. Shakshi Pandey
4. Shehyaaz Khan Nayazi




                 

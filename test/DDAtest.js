const DDA = artifacts.require("./DDA.sol");
const CheckContract = artifacts.require("./Check.sol"); 
const DRPReact = artifacts.require("./DRPReaction.sol"); 


contract("DDA", accounts => {  
    describe("Client tests", () => {
        it("...check if client is registered", async () => {
            const ddaInstance = await DDA.deployed();
            const isRegistered = await ddaInstance.isClientRegistered.call({
                from: accounts[0]
            });
            assert.equal(isRegistered, false, "The client was not registered.");
        });

        it("...register client", async () => {
            const ddaInstance = await DDA.deployed();
            const checkInstance = await CheckContract.deployed();
            const clientRegFee = await ddaInstance.client_registration_fee.call({
                from: accounts[0]
            });
            await ddaInstance.registerClient(
                web3.utils.utf8ToHex("Riyanchhi"),
                Math.floor(new Date("2021-06-03").getTime()/1000),
                Math.floor(new Date("2021-06-04").getTime()/1000),
                checkInstance.address,
                1,
                    {
                        from: accounts[0] ,
                        value: clientRegFee
                    }
            );
            const client = await ddaInstance.getClientDetails.call({
                from: accounts[0]
            });
            assert.equal(web3.utils.hexToUtf8(client[0]), "Riyanchhi", "The client name should be Riyanchhi");
            assert.equal(client[1], Math.floor(new Date("2021-06-03").getTime()/1000), "Valid from should be 3rd June 2021.");
            assert.equal(client[2],Math.floor(new Date("2021-06-04").getTime()/1000), "Valid to should be 4th June 2021.");
            assert.equal(client[3], accounts[0], "The client address does not match.");
            assert.equal(client[4], checkInstance.address, "Check contract address does not match.");
        });

        it("...get CCP Status", async () => {
            const ddaInstance = await DDA.deployed();
            const checkInstance = await CheckContract.deployed();
            const clientRegFee = await ddaInstance.client_registration_fee.call({
                from: accounts[1]
            });
            await ddaInstance.registerClient(
                web3.utils.utf8ToHex("Shehyaaz"),
                Math.floor(new Date("2021-06-03").getTime()/1000),
                Math.floor(new Date("2023-06-05").getTime()/1000),
                checkInstance.address,
                1,
                    {
                        from: accounts[1] ,
                        value: clientRegFee
                    }
            );
            const ccp = await ddaInstance.getCCPStatus.call({
                from: accounts[1]
            });
            assert.equal(ccp[0], true, "CCP should be valid");
            assert.equal(ccp[1], true, "Check contract address should be valid");
        });
    });  
    
    describe("Domain tests", () => {
        it("...check if domain is registered", async () => {
            const ddaInstance = await DDA.deployed();
            const isRegistered = await ddaInstance.isDomainRegistered.call({
                from: accounts[0]
            });
            assert.equal(isRegistered, false, "The domain was not registered.");
        });

        it("...register domain", async () => {
            const ddaInstance = await DDA.deployed();
            const domainRegFee = await ddaInstance.domain_registration_fee.call({
                from: accounts[0]
            });
            const drpInstance = await DRPReact.deployed();
            await ddaInstance.registerDomain(
                web3.utils.utf8ToHex("google.com"),
                web3.utils.utf8ToHex("google.com"),
                Math.floor(new Date("2021-06-03").getTime()/1000),
                Math.floor(new Date("2021-06-04").getTime()/1000),
                web3.utils.toWei("1","ether"),
                drpInstance.address,
                1,
                {
                    from: accounts[0] ,
                    value: domainRegFee
                }
            );
            const domain = await ddaInstance.getDomainDetails.call({
                from: accounts[0]
            });
            assert.equal(web3.utils.hexToUtf8(domain[0]), "google.com", "The domain name should be google.com");
            assert.equal(web3.utils.hexToUtf8(domain[1]), "google.com", "The issuer name should be google.com");
            assert.equal(domain[2], Math.floor(new Date("2021-06-03").getTime()/1000), "Valid from should be 3rd June 2021.");
            assert.equal(domain[3], Math.floor(new Date("2021-06-04").getTime()/1000), "Valid to should be 4th June 2021.");
            assert.equal(domain[4], web3.utils.toWei("1","ether"), "The drp price does not match.");
            assert.equal(domain[5], accounts[0], "The domain address does not match.");
            assert.equal(domain[6], drpInstance.address,  "React contract address does not match.");
        });

        it("...get DRP Status", async () => {
            const ddaInstance = await DDA.deployed();
            const domainRegFee = await ddaInstance.domain_registration_fee.call({
                from: accounts[2]
            });
            const drpInstance = await DRPReact.deployed();
            await ddaInstance.registerDomain(
                web3.utils.utf8ToHex("facebook.com"),
                web3.utils.utf8ToHex("facebook.com"),
                Math.floor(new Date("2021-06-03").getTime()/1000),
                Math.floor(new Date("2023-06-04").getTime()/1000),
                web3.utils.toWei("1","ether"),
                drpInstance.address,
                1,
                {
                    from: accounts[2] ,
                    value: domainRegFee
                }
            );
            const drp = await ddaInstance.getDRPStatus.call({
                from: accounts[2]
            });
            assert.equal(drp[0], true, "DRP should be valid");
            assert.equal(drp[1], true, "React contract address should be valid");
        });
    });

    it("... check purchase DRP", async () => {
        const ddaInstance = await DDA.deployed();
        // register client
        const checkInstance = await CheckContract.deployed();
        const clientRegFee = await ddaInstance.client_registration_fee.call({
            from: accounts[3]
        });
        await ddaInstance.registerClient(
            web3.utils.utf8ToHex("Shakshi"),
            Math.floor(new Date("2021-06-03").getTime()/1000),
            Math.floor(new Date("2021-06-04").getTime()/1000),
            checkInstance.address,
            1,
                {
                    from: accounts[3] ,
                    value: clientRegFee
                }
        );

        // register domain
        const drpInstance = await DRPReact.deployed();
        const domainRegFee = await ddaInstance.domain_registration_fee.call({
            from: accounts[4]
        });
        await ddaInstance.registerDomain(
            web3.utils.utf8ToHex("github.com"),
            web3.utils.utf8ToHex("github.com"),
            Math.floor(new Date("2021-06-03").getTime()/1000),
            Math.floor(new Date("2023-06-04").getTime()/1000),
            web3.utils.toWei("1","ether"),
            drpInstance.address,
            1,
            {
                from: accounts[4] ,
                value: domainRegFee
            }
        );
        const domainData = await ddaInstance.getDomainDetails.call({
            from: accounts[4]
        });
        
        // purchase DRP
        await ddaInstance.purchaseDRP(
            domainData[5],
            {
                from: accounts[3],
                value: domainData[4]
            }
        );
        // get domain escrowed amount
        const escrowAmount = await ddaInstance.getEscrowAmount.call({
            from: accounts[4]
        });
        // get purchased DRP details
        const purchasedDRP = await ddaInstance.getClientDRPList.call(
            0,
            {
                from: accounts[3]
            }
        );

        assert.equal(escrowAmount, web3.utils.toWei("0.8","ether"), "Escrow amount should be 0.8 ether");
        assert.equal(purchasedDRP[0], domainData[0], "Domain name should be github.com");
        assert.equal(purchasedDRP[1].toString(), domainData[2].toString(), "DRP validFrom should match");
        assert.equal(purchasedDRP[2].toString(), domainData[3].toString(), "DRP validTo should match");
        assert.equal(purchasedDRP[3].toString(), domainData[4].toString(), "DRP price should match");
    });
});
const DDA = artifacts.require("./DDA.sol");
const CheckContract = artifacts.require("./Check.sol"); 
const DRPReact = artifacts.require("./DRPReaction.sol"); 


contract("DDA", accounts => {  
    describe("CheckDomainRegistration", () => {
        it("...should return false", async () => {
                const ddaInstance = await DDA.deployed();
                const isCRegistered = await ddaInstance.isClientRegistered.call();
                assert.equal(isCRegistered, false, "The client was not registered.");
            });
        //test for client registeration
        it("...register client", async () => {
            const ddaInstance = await DDA.deployed();
            const checkInstance = await CheckContract.deployed();
            const clientRegFee = await ddaInstance.client_registration_fee.call();
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
            const client = await ddaInstance.getClientDetails.call();
            assert.equal(web3.utils.hexToUtf8(client[0]), "Riyanchhi", "The client name should be Riyanchhi");
            assert.equal(client[1], Math.floor(new Date("2021-06-03").getTime()/1000), "Valid from should be 3rd June 2021.");
            assert.equal(client[2],Math.floor(new Date("2021-06-04").getTime()/1000), "Valid to should be 4th June 2021.");
            assert.equal(client[3], accounts[0], "The client address does not match.");
            assert.equal(client[4], checkInstance.address, "Check contract address does not match.");
        });
    });  
    
    //test for domain registeration
    describe("CheckDomainRegistration", () => {
 
        it("...should return false", async () => {
            const ddaInstance = await DDA.deployed();
            const isDRegistered = await ddaInstance.isDomainRegistered.call();
            assert.equal(isDRegistered, false, "The domain was not registered.");
        });
        it("...register domain", async () => {
            const ddaInstance = await DDA.deployed();
            const domainRegFee = await ddaInstance.domain_registration_fee.call();
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
        const domain = await ddaInstance.getDomainDetails.call();
        assert.equal(web3.utils.hexToUtf8(domain[0]), "google.com", "The domain name should be google.com");
        assert.equal(web3.utils.hexToUtf8(domain[1]), "google.com", "The issuer name should be google.com");
        assert.equal(domain[2], Math.floor(new Date("2021-06-03").getTime()/1000), "Valid from should be 3rd June 2021.");
        assert.equal(domain[3],Math.floor(new Date("2021-06-04").getTime()/1000), "Valid to should be 4th June 2021.");
        assert.equal(domain[4],web3.utils.toWei("1","ether"), "The drp price does not match.");
        assert.equal(domain[5], accounts[0], "The domain address does not match.");
        assert.equal(domain[6], drpInstance.address,  "React contract address does not match.");
        });
    });

    describe("CheckValidity", () => {
 
        it("...get CCP Status", async () => {
            const ddaInstance = await DDA.deployed();
            const checkInstance = await CheckContract.deployed();
            const clientRegFee = await ddaInstance.client_registration_fee.call();
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
                const ccp = await ddaInstance.getCCPStatus.call();
                assert.equal(ccp[0],true, "true");
                assert.equal(ccp[1],true, "true");
        });

         it.only("...get DRP Status", async () => {
            const ddaInstance = await DDA.deployed();
            const domainRegFee = await ddaInstance.domain_registration_fee.call();
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
        const drp = await ddaInstance.getDRPStatus.call();
        assert.equal(drp[0],true, "true");
        assert.equal(drp[1],true, "true");
        
        });
    });
});
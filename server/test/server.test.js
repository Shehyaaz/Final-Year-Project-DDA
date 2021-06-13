const server = require("../server.js");
const chai = require("chai");
const chaiHttp = require("chai-http");

// Assertion
chai.should();
chai.use(chaiHttp);

describe("Test GET APIs", () => {
    describe("Test /verify API", () => {
        const validDomains = [
            "www.google.com",
            "google.com",
            "github.com",
            "no-sct.badssl.com",
            "microsoft.com"
        ];
    
        validDomains.forEach((domain) => {
            it(domain+" should be a valid domain", (done) => {
                chai.request(server)
                    .get("/api/verify?domainName="+domain)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an("object");
                        res.body.should.have.property("message").eq("Valid domain");
                    done();
                    });
            });
        });

        const invalidDomains = [
            "wgoogle.com",
            "shehyaaz.com",
            "wmikro.com"
        ];

        invalidDomains.forEach((domain) => {
            it(domain+" should be an invalid domain", (done) => {
                chai.request(server)
                    .get("/api/verify?domainName="+domain)
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.be.an("object");
                        res.body.should.have.property("message").eq("Invalid domain");
                    done();
                    });
            });
        });
    });

    // tests may have to be modified if the domain certificates are updated in the future
    describe("Test /getsct API", () => {
        it("should return google.com SCT details", (done) => {
            chai.request(server)
                .get("/api/getsct?domainName=google.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("certValidFrom").eq(Math.floor(new Date("2021-05-17T07:06:50").getTime()/1000));
                    res.body.should.have.property("certValidTo").eq(Math.floor(new Date("2021-08-09T07:06:49").getTime()/1000));
                    res.body.should.have.property("sctList")
                            .which.is.an("array")
                            .that.deep.includes(
                                {
                                    "logID": "0x7d3ef2f88fff88556824c2c0ca9e5289792bc50e78097f2e6a9768997e22f0d7",
                                    "timestamp": Math.floor(new Date("2021-05-17T08:06:52").getTime()/1000)
                                },
                                {
                                    "logID": "0xeec095ee8d72640f92e3c3b91bc712a3696a097b4b6a1a1438e647b2cbedc5f9",
                                    "timestamp": Math.floor(new Date("2021-05-17T08:06:52").getTime()/1000)
                                }
                            );
                    res.body.should.have.property("ocspRes").eq("good");
                done();
                });
        });

        it("should return no-sct.badssl.com SCT details", (done) => {
            chai.request(server)
                .get("/api/getsct?domainName=no-sct.badssl.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("certValidFrom").eq(Math.floor(new Date("2019-10-05T05:30:00").getTime()/1000));
                    res.body.should.have.property("certValidTo").eq(Math.floor(new Date("2021-10-13T17:30:00").getTime()/1000));
                    res.body.should.have.property("sctList")
                            .which.is.an("array")
                            .with.length(0);
                    res.body.should.have.property("ocspRes").eq("good");
                done();
                });
        });

        it("should return revoked.badssl.com SCT details", (done) => {
            chai.request(server)
                .get("/api/getsct?domainName=revoked.badssl.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("certValidFrom").eq(Math.floor(new Date("2019-10-04T05:30:00").getTime()/1000));
                    res.body.should.have.property("certValidTo").eq(Math.floor(new Date("2021-10-08T17:30:00").getTime()/1000));
                    res.body.should.have.property("sctList")
                            .which.is.an("array")
                            .with.length(3);
                    res.body.should.have.property("ocspRes").eq("revoked");
                done();
                });
        });

        it("should return github.com SCT details", (done) => {
            chai.request(server)
                .get("/api/getsct?domainName=github.com")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("certValidFrom").eq(Math.floor(new Date("2021-03-25T05:30:00").getTime()/1000));
                    res.body.should.have.property("certValidTo").eq(Math.floor(new Date("2022-03-31T05:29:59").getTime()/1000));
                    res.body.should.have.property("sctList")
                            .which.is.an("array")
                            .with.length(2);
                    res.body.should.have.property("ocspRes").eq("unknown");
                done();
                });
        });
    });
});
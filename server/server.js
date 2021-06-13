const express = require('express');
const path = require('path');
const https = require('https');
const pkijs = require('pkijs');
const asn1js = require('asn1js');
const ocsp = require('ocsp');

const app = express();
const port = process.env.PORT || 5000;

const getCert = (domainName) => new Promise((resolve, reject) => {
  const options = {
    agent: new https.Agent({ //disable session caching
      maxCachedSessions: 0,
      rejectUnauthorized: false
    })
  };

	const req = https.request("https://"+domainName, options, (res) => {
    const cert = res.socket.getPeerCertificate(true);
    res.socket.destroy();
    resolve(cert);
  });
  
  req.on("error", (err) => {
    reject(new Error(err));
  });
  req.end();
});

const getCertDetails = (certDer) => {
      // And convert the cert into a BER encoded one
      const ber = new Uint8Array(certDer).buffer;
      // And now asn1js can decode things
      const asn1 = asn1js.fromBER(ber);
      // cert is a pkijs Certificate object
      const cert = new pkijs.Certificate({ schema: asn1.result });
      // extract sct list from cert
      const sctOID = "1.3.6.1.4.1.11129.2.4.2";
      const sctList = [];
      for(const ext of cert["extensions"]){
          if(ext["extnID"] === sctOID){
              for(const sct of ext["parsedValue"]["timestamps"]){
                  sctList.push({
                      "logID":  "0x"+ Buffer.from(sct["logID"],"hex").toString("hex"),
                      "timestamp": Math.floor(new Date(sct["timestamp"]).getTime()/1000)
                  });
              }
              break;
          }
      }
      return ({
          certValidFrom: Math.floor(new Date(cert["notBefore"]["value"]).getTime()/1000), 
          certValidTo: Math.floor(new Date(cert["notAfter"]["value"]).getTime()/1000), 
          sctList
      });
}

if(process.env.NODE_ENV === "production"){
  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, '../client/build')));
}

// Enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/* app get end-points */

// checks if a domain is valid or not
app.get("/api/verify", (req, res) => {
  if(req.query && req.query.domainName){
    getCert(req.query.domainName)
    .then(() => {
      res.status(200).send({message: "Valid domain"});
    })
    .catch(() =>{
      res.status(404).send({message: "Invalid domain"});
    });
  }
  else{
    res.status(400).send({message: "Invalid request, please specify domain name"});
  }
});

// returns the SCT and OCSP details of a domain's certificate
app.get("/api/getsct", (req, res) => {
  if(req.query && req.query.domainName){
    getCert(req.query.domainName)
    .then( (cert) => {
      certDetails = getCertDetails(cert.raw);
      // get OCSP response
      ocsp.check({cert: cert.raw, issuer: cert.issuerCertificate.raw}, (err, ocspRes) => {
        certDetails.ocspRes = ocspRes ? ocspRes.type: "unknown";
        res.status(200).send(certDetails);
      });
    })
    .catch((err) => {
      res.status(404).send({message: "An error was encountered when processing certificate"+err});
    });
  }
  else{
    res.status(400).send({message: "Invalid request, please specify domain name"});
  } 
});

// returns the set of CT logs trusted and used by the system
app.get("/api/getctlogs", (req, res) => {
  try{
    const trustedCTLogs = require("./ctlogs/trustedCTLogs.json");
    res.status(200).send(trustedCTLogs);
  }
  catch(err){
    res.status(500).send({message: "Unable to fetch CT logs !\n"+err.message});
  }
});

if(process.env.NODE_ENV === "production"){
  // All remaining requests return the React app, so it can handle routing.
  app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// This displays message that the server running and listening to specified port
module.exports = app.listen(port, () => console.log(`Listening on port ${port}`));
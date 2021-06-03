const express = require('express');
const path = require('path');
const https = require('https');
const pkijs = require('pkijs');
const asn1js = require('asn1js');

const app = express();
const port = process.env.PORT || 3001;
app.use(express.static(path.join(__dirname, 'client/build')));

const getCert = (domainName) => new Promise((resolve, reject) => {
  const options = {
    rejectUnauthorized: true,
    agent: new https.Agent({ //disable session caching
      maxCachedSessions: 0
    })
  };
	const req = https.request("https://"+domainName, options, (res)=>{
		const cert = res.socket.getPeerCertificate(false);
    res.socket.destroy();
    resolve(cert);
	});
  req.on("error", (err) => {
    reject(new Error(err));
  });
  req.end();
});

function getCertDetails(certDer) {
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

/* app get end-points */
// create a GET route, this serves the front-end files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});


app.get("/welcome", (req, res) => {
  res.send({ message: "YOUR EXPRESS BACKEND IS CONNECTED TO REACT" });
});

app.get("/verify", (req, res) => {
  if(req.query && req.query.domainName){
    getCert(req.query.domainName)
    .then(() => {
      res.status(200).send({message: "Valid domain"});
    })
    .catch(() =>{
      res.status(500).send({message: "Invalid domain"});
    });
  }
  else{
    res.status(400).send({message: "Invalid request, please specify domain name"});
  }
});

app.get("/getsct", (req, res) => {
  if(req.query && req.query.domainName){
    getCert(req.query.domainName)
    .then((cert) => {
      certDetails = getCertDetails(cert.raw);
      res.status(200).send(certDetails);
    })
    .catch((err) => {
      res.status(500).send({message: "An error was encountered when processing certificate"+err});
    });
  }
  else{
    res.status(400).send({message: "Invalid request, please specify domain name"});
  } 
});

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`));
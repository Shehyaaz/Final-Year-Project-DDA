const pkijs = require('pkijs');
const asn1js = require('asn1js');

export default function getSCTList(pem) {
    if(typeof pem !== 'string') {
        throw new Error('Expected PEM as string, '+typeof pem);
    }
    try{
        // Load certificate in PEM encoding (base64 encoded DER)
        const b64 = pem.replace(/(-----(BEGIN|END) CERTIFICATE-----|[\n\r])/g, '')
        // Now that we have decoded the cert it's now in DER-encoding
        const der = Buffer.from(b64, 'base64')
        // And convert the cert into a BER encoded one
        const ber = new Uint8Array(der).buffer
        // And now asn1js can decode things
        const asn1 = asn1js.fromBER(ber)
        // cert is a pkijs Certificate object
        const cert = new pkijs.Certificate({ schema: asn1.result })
        // extract sct list from cert
        const sctOID = "1.3.6.1.4.1.11129.2.4.2";
        const sctList = [];
        for(const ext of cert["extensions"]){
            if(ext["extnID"] === sctOID){
                for(const sct of ext["parsedValue"]["timestamps"]){
                    sctList.push({
                        "logID":  "0x"+ Buffer.from(sct["logID"],"hex").toString("hex"),
                        "timestamp": new Date(sct["timestamp"]).getTime()
                    });
                }
                break;
            }
        }
        return sctList;
    } catch(err){
        throw new Error("Could not parse Certificate file, please re-upload!");
    }
}
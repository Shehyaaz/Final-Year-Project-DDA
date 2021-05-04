/*
 *	Run this file separately in the terminal. To run type: node getCTLogs.js 
 * /
const request = require("request");
const fs = require("fs");
/* 
The below url contains the list of CT Logs that are currently compliant with Google Chrome's CT policy (or have been and were disqualified), and are included in Chrome
Source : https://github.com/google/certificate-transparency-community-site/blob/master/docs/google/known-logs.md
*/
const url = "https://www.gstatic.com/ct/log_list/v2/log_list.json";
request.get({
    url: url,
    json: true,
    headers: {'User-Agent': 'request'}
  }, (err, res, data) => {
    if (err) {
      console.log('Error:', err);
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode);
    } else {
	  getTrustedLogData(data);
    }
});
/* process ctLogData */
function getTrustedLogData(ctLogData){
	let trustedLogData = []; // stores log data trusted by DDA
	for(const operator of ctLogData["operators"]){
		for (const log of operator["logs"]){
			if ( "usable" in log["state"] ){
				const { description, log_id, url, ...rest } = { ...log };
				trustedLogData.push({description, log_id, url});
			}
		}
	}
	// write trustedLogData to json file
	try {
		fs.writeFileSync('trustedCTLogs.json', JSON.stringify(trustedLogData, null, 4));
		console.log("Trusted CT Log data is saved as JSON.");
	} catch (error) {
		console.error(err);
	}
}
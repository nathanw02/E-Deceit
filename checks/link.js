const request = require('request');
require('dotenv').config();

module.exports = function check(links, cb){
    let results = [];

    links.forEach(link => {
        request.post({
            url: `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.API}`,
            headers: {
                'Content-Type': 'application/json'
            },
            json: {
                "client": {
                    "clientId": "emailcheck",
                    "clientVersion": "1.0"
                },
                "threatInfo": {
                    "threatTypes":      ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                    "platformTypes":    ["ANY_PLATFORM"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [
                        {"url": link}
                    ]
                }
            }
        }, (err, res) => {
            if(err) return console.log(err);
            
            if(Object.keys(res.body).length != 0){
                results.push(res.body);
            }
            
        });

    });

    setTimeout(() => {
        cb(results);
    }, 5000);
}


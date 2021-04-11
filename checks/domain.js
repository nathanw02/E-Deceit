const lineReader = require('line-reader');

module.exports = function check(domain, cb){
    let domains = [];
    let emailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
    
    lineReader.eachLine('../checks/domains.txt', line => {
        domains.push(line);
    });

    setTimeout(() => {
        let result = {};

        if(!domains.includes(domain)){
            result.domain = domain;
        }else{
            result.domain = 'common';
        }

        if(emailDomains.includes(domain)){
            result.emailDomain = domain;
        }
        
        cb(result);
    }, 1000);
}
const lineReader = require('line-reader');

module.exports = function check(body, cb){
    let keywords = [];
    
    lineReader.eachLine('../checks/keywords.txt', line => {
        keywords.push(line);
    });
    setTimeout(() => {
        let matches = [];

        keywords.forEach(word => {
            if(body.includes(word.toLowerCase())){
                matches.push(word.toLowerCase());
            }
        });

        return cb(matches);

    }, 1000);
}
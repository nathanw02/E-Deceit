const chalk = require('chalk');

module.exports = class Mail{
    constructor(to, results, transporter){
        this.to = to;
        this.results = results;
        this.transporter = transporter
    }

    toText(){
        let text = '';

        let domain = this.results.domain;
        if(domain.emailDomain != undefined){
            text += `❌ ${domain.emailDomain} | Companies will not use common email service domains when sending emails.\n`
        
        }else{
            if(domain.domain == 'common'){
                text += `✅ ${domain.domain} is a domain from a well known company\n`;
            }else{
                text += `❌ ${domain.domain} is not a domain from a well known company.\n`;
     
            }
        }

        text += '\n';

        let keyword = this.results.keyword;
        if(keyword.match.length == 0){
            text += '✅ No common phishing/scam keywords found\n';
        }else{
            text += '❌ Common phishing/scam keywords found:\n';
            keyword.match.forEach(word => {
                text += `${word}\n`;
   
            });
        }

        text += '\n';

        let link = this.results.link;
        if(link.length == 0){
            text += '✅ Links in email are not malicious ACCORDING TO the Google Safe Browsing Lookup API\n';
        
        }else{
            link.forEach(match => {
                text += `❌ ${match.matches[0].threat.url} has been marked as ${match.matches[0].threatType} by the Google Safe Browsing Lookup API\n`;

            });
        }

        text += '\n';

        text += `These results do not guarantee the safety of the email.`;
        
        return text;
    }

    async send(){
        await this.transporter.sendMail({
            to: this.to,
            subject: 'E-Deceit Scan',
            text: this.toText(this.results), 
        });

        return console.log(chalk.blue('SENT'));
    }
};

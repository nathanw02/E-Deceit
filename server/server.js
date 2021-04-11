const SMTPServer = require('smtp-server').SMTPServer;
const parser = require('mailparser').simpleParser;
const domainCheck = require('../checks/domain');
const keywordCheck = require('../checks/keywords');
const linkCheck = require('../checks/link');
const nodemailer = require('nodemailer');
const Mail = require('./mail');
const fs = require('fs');
require('dotenv').config();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});

var log = [];
fs.readFile('./log.json', (err, data) => {
    if(err) return console.log(err);
    let o = JSON.parse(data);
    o.forEach((e) => {
        log.push(e);
    });
});

const server = new SMTPServer({
    onData(stream, session, callback) {
        parser(stream, {}, (err, parsed) => {
            if (err) return console.log('Error: ' , err);

            let from = parsed.from.text; 
            let subject = parsed.subject;
            let body = parsed.text;
            let timestamp = new Date();

            let email = {
                'from': from,
                'subject': subject,
                'body': body,
                'timestamp': timestamp
            };

            
            if(!log.some(el => {
                return el.from == from && el.subject == subject && el.body == body;
            })){
                
                log.push(email);

                fs.writeFileSync('./log.json', JSON.stringify(log, null, 4), (err) => {
                    if(err) return console.log(err);
                });

                main(getData(body), from);
    
            }
            
            stream.on('end', callback);
    
        });
      
    },
    disabledCommands: ['AUTH']

});

server.listen(process.env.PORT, process.env.IP);

function main(email, from){
    let subject = email.subject;
    let body = email.body;
    let domain = email.domain;
    let link = email.link;

    let results = {
        keyword:{
            match: []
        }
    };

    domainCheck(domain, res => {
        results.domain = res;
        let matches = [];
    
        keywordCheck(body, res => {
            matches.push(...res);

            keywordCheck(subject, res => {
                matches.push(...res);
                results.keyword.match = matches;
            
                linkCheck(link, res => {
                    results.link = res;

                    let mail = new Mail(from, results, transporter);
                    mail.send();

                });
            });
        
        });
    });
}

function find(text, startString, stopChar){
    let string = '';
    for(var i = 0; i < text.length; i++){
        if(text.substring(i, i + startString.length) == startString){
            let index = i + startString.length;
            while(text.charAt(index) != stopChar){
                string += text.charAt(index);
                index++;
            }
            break;
        }
    }

    return string;
}

function getBody(text){
    let l = text.split('\n');

    l.splice(0, 5);

    return l.join('\n');
}

function getLinks(body){
    let l = body.match(/\bhttps?:\/\/\S+/gi);
    if(l == null){
        return [];
    }
    for(var i = 0; i < l.length; i++){
        l[i] = l[i].replace(/>|,/g, '');
    }
  
    return l;
}

function getData(body){

    let from = find(body, '<', '>');
    let subject = find(body, 'Subject:', '\n');
    let bodyBody = getBody(body);
    let domain = from.split('@')[1];
    let links = getLinks(bodyBody);

    return {
        'subject': subject,
        'body': bodyBody.toLowerCase(),
        'domain': domain,
        'link': links
    }
}

const rp = require('request-promise');
const $ = require('cheerio');
const {Transform} = require('stream');


class TransformProfileLinksToContacts extends Transform{
    constructor(options = {}){
        super({...options, objectMode: true});
        this.requests = [];
    }
     
    _transform(chunk, encoding, callback){
        let profileUrl = chunk;
        profileUrl = profileUrl.replace(/\r?\n|\r/g, "");
        const schoolInfo = this.getSchoolInfo(profileUrl);
        this.requests.push(this.prepareContactInfo(schoolInfo));
        if(this.requests.length < 10){
            return callback();
        }
        
        this.processRequests(callback);
    }

    _flush(callback){
        this.processRequests(callback);
    }
    
    getSchoolInfo(url){ 
        console.log(url);
        var options = {
            uri: url,
            family: 4
        };
        
        return rp(options);
    }

    
    
    prepareContactInfo(schoolInfo){
        return schoolInfo.then((html) => {
            let name =  $('h2', html).text().trim();
            let address, email, phoneNo, contact;

            const signage = $(html).find('.signage').length;
            let parentContactElement, noOfChildren;
            if(signage){
                parentContactElement = $('.signage', html).next();
            }
            else{
                parentContactElement = $('.text-center .sidebar-box:first-child .list-unstyled', html);
            }
            noOfChildren = parentContactElement.find('li').length;
            if(noOfChildren == 3){
                address = this.getElementText('li:nth-child(1)', parentContactElement);
                email = this.getElementText('li:nth-child(2)', parentContactElement);
                phoneNo = this.getElementText('li:nth-child(3)', parentContactElement);
            }
            else{
                address = this.getElementText('li:nth-child(1)', parentContactElement);
                phoneNo = this.getElementText('li:nth-child(2)', parentContactElement);
                email = 'Not Available'
            }

            contact = `${name} \t ${address} \t ${phoneNo} \t ${email}\r\n`;
            return contact;
        })
       
    }

    getElementText(element, html){
        let result, elem;
        elem = $(`${element}`, html)[0];
        result = elem ? elem.children[1].data.trim() : 'Not Available';
        return result;
    }

    processRequests(callback){
        return Promise.all(this.requests)
            .then((responses) => {
                this.requests = [];
                this.push(responses.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue;
                }, ''));
                callback();
            })
    }
   
}

module.exports = TransformProfileLinksToContacts;
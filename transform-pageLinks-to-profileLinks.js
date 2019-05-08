const rp = require('request-promise');
const $ = require('cheerio');
const {Transform} = require('stream');

class TransformPageLinksToProfileLinks extends Transform{
    constructor(options = {}){
        super({...options, objectMode: true});
        this.requests = [];
    }
     
    _transform(chunk, encoding, callback){
        const pageLink = chunk;
        const page = this.getPage(pageLink[0]);
        this.requests.push(this.getProfileLinks(page));
        if(this.requests.length < 3){
            return callback();
        }
        
        this.processRequests(callback);
    }

    _flush(callback){
        this.processRequests(callback);
    }

    getProfileLinks(page){
        return page.then((html) => {
            const originUrl = 'http://www.lagosschoolsonline.com';
            let schoolsProfileUrls = '';
            let schoolInfoSelector = $('h4 > a', html);
            let noOfSchools = schoolInfoSelector.length;
            for (let i = 0; i < noOfSchools; i++) {
                let path = $('h4 > a', html)[i].attribs.href;
                schoolsProfileUrls += `${originUrl+path}\r\n`; 
            }
            return schoolsProfileUrls;  
        })
    }

    getPage(pageLink){
        return rp(pageLink);
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

module.exports = TransformPageLinksToProfileLinks;
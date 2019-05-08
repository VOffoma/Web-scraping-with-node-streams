const stream = require('stream');
const CsvParser = require('csv-parse');
const fs = require('fs')

const pageLink = 'http://www.lagosschoolsonline.com/Schools?page=';
const schoolLinksFile = './schoolLinks.csv';
const url = 'http://www.lagosschoolsonline.com/Schools';
const TransformPageLinksToProfileLinks = require('./transform-pageLinks-to-profileLinks');
const TransformProfileLinksToContacts = require('./transform-profileLinks-to-contacts');

const generateFileOfPaginationLinks = function(pageLink, path){
    try {
        if (!fs.existsSync(path)) {
            const file = fs.createWriteStream(path);
            for (let i = 1; i <= 3; i++) {
                file.write(
                    `${pageLink + i} \r\n`
                );
            }
            file.end();
        }
      } catch(err) {
        console.error(err)
      }
}

// generateFileOfPaginationLinks(pageLink, schoolLinksFile);

// const getSchoolProfileUrls = function(){
//     const transformPageLinksToProfileLinks = new TransformPageLinksToProfileLinks();
//     const readSchoolLinksStream = fs.createReadStream(schoolLinksFile);
//     const csvParser = new CsvParser({});

//     const writeProfileUrlsStream = fs.createWriteStream('./schoolProfileUrls.csv');

//     stream.pipeline(
//         readSchoolLinksStream,
//         csvParser,
//         transformPageLinksToProfileLinks,
//         writeProfileUrlsStream,
//         (error) => {
//             if(error) {
//                 console.error(`error: ${error}`);
//                 return process.exit(1);
//             }
//             process.exit();
//         });
// }

// //getSchoolProfileUrls();

// const getSchoolsContact = function(){
//     const transformProfileLinksToContacts = new TransformProfileLinksToContacts();
//     const readSchoolLinksStream = fs.createReadStream('./schoolProfileUrls.csv');
//     const csvParser = new CsvParser({});

//     const writeProfileUrlsStream = fs.createWriteStream('./schoolsContact.csv');

//     stream.pipeline(
//         readSchoolLinksStream,
//         csvParser,
//         transformProfileLinksToContacts,
//         writeProfileUrlsStream,
//         (error) => {
//             if(error) {
//                 console.error(`error: ${error}`);
//                 return process.exit(1);
//             }
//             process.exit();
//         });
// }

// getSchoolsContact();




const getSchoolsContact = function(){
    const transformPageLinksToProfileLinks = new TransformPageLinksToProfileLinks();
    const transformProfileLinksToContacts = new TransformProfileLinksToContacts();

    const readSchoolLinksStream = fs.createReadStream('./schoolLinks.csv');
    const writeProfileUrlsStream = fs.createWriteStream('./schoolsContact.csv');

    const csvParser = new CsvParser({});
    
    stream.pipeline(
        readSchoolLinksStream,
        csvParser,
        transformPageLinksToProfileLinks,
        transformProfileLinksToContacts,
        writeProfileUrlsStream,
        (error) => {
            if(error) {
                console.error(`error: ${error}`);
                return process.exit(1);
            }
            process.exit();
        });
}

getSchoolsContact();



  

  







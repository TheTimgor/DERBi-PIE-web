const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'DERBI-PIE';
const client = new MongoClient(uri);

// region helpers
function mapRegexes(field, regexes){
    return {$and: regexes.map((el) => ({[field]: {$regex: el}}))}
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
// endregion

router.get('/', async (req, res) => {
    // Perform the database query to retrieve search results
    let searchResults = []
    await getIDs(req.query);
    // if (req.query.search || req.query.search == ""){
    //     searchResults = await performSearch(req.query.search);
    // }else{
    // }
    // if there is a single result, we redirect to it
    if(searchResults.length === 1){
        res.redirect(`/dictionary/${encodeURIComponent(searchResults[0].entry_id)}`);
        return
    }

    // Render the search results page
    res.render('results', { results: searchResults });
});
const charReplacements = {
    // Add more character replacements as needed
};

const linguisticFeatures = {
    stop: 'pʰ|bʰ|tʰ|dʰ|ḱʰ|ǵʰ|kʰ|gʰ|kʷʰ|T|K|k\'ʰ|ǵʰ|ǵ\'|kʷ|gʷʰ|g\'',
    fricative: 'regex_fricative',
    glide: 'regex_glide',
    T: 'regex_T',
    K: 'regex_K',
    H: 'regex_H',
    // Add more linguistic features as needed
};

function generateRegex(pseudoRegex) {
    // remove any accidental repeated dashes, it messes up subsequent things
    pseudoRegex = pseudoRegex.replace(/-+/, "-")

    // Replace custom characters with corresponding regex patterns
    for (const char in charReplacements) {
        pseudoRegex = pseudoRegex.replace(new RegExp(char, 'g'), charReplacements[char]);
    }

    // Replace linguistic features with corresponding regex patterns
    for (const feature in linguisticFeatures) {
        // there are three cases
        // 1. if there is a - followed by a negative group
        pseudoRegex = pseudoRegex.replace(new RegExp(`(-\\[-${feature}\\])`, 'g'), `(?![^\\d]+(?:${linguisticFeatures[feature]}))`)
        // 2. if there is a negative group without the preceding -
        pseudoRegex = pseudoRegex.replace(new RegExp(`(\\[-${feature}\\])`, 'g'), `(?!${linguisticFeatures[feature]})`)
        // 3. if there is a positive group
        pseudoRegex = pseudoRegex.replace(new RegExp(`(\\[\\+${feature}\\])`, 'g'), `(?:${linguisticFeatures[feature]})`)

    }

    // Replace "#" with word boundary \b
    pseudoRegex = pseudoRegex.replace(/#/g, '\\b');

    // Replace "-" with 1 or more non whitespace regex
    pseudoRegex = pseudoRegex.replace(/-/g, '[^\\s]+');

    return pseudoRegex;
}

async function getIDs(data) {
    console.log(data)
    // separate queries are needed for each of the possible categories

    // todo: I have no idea what word shape refers to
    let orQuery = []
    let regexes = generateRegex(data["rootShape"])
    console.log(regexes)

    if(data.checkRoots){
        console.log("checking the roots")
        orQuery.push(mapRegexes("root", regexes))
    }
    if(data.checkWords){
        // todo: I have no idea what this means
        console.log("checking the words")
    }
    if(data.checkMeanings){
        console.log("checking the meanings")
        orQuery.push(mapRegexes("meaning", regexes))
    }

    let query = {$or: orQuery}
    // search for the entries and extract their IDs. add them to the list
    return performSearch(query)
    // console.log(JSON.stringify(query))

    // todo: this one requires searching differently
    if(data.checkDerivatives){
        console.log("checking the derivatives")
        // orQuery.push({meaning: shapedQuery})
    }
    return []
}

function shapedRegexes(begins, contains, shape) {
    // Define sound classes and their regex equivalents
    let soundClasses = {
        stop: "[ptk]",
        fricative: "[sz]",
        vowel: "[aeiou]"
        // Add more sound classes and their regex equivalents as needed
    };

    let regexes = []

    if (begins && begins.length > 0) {regexes.push(`^${escapeRegExp(begins)}`)}
    if (contains && contains.length > 0) {regexes.push(escapeRegExp(contains))}

    if (shape && shape.length > 0){
        // Split the shape on "+"
        let shapeParts = shape.split("+");

        // Process each shape part
        let shapeRegex = shapeParts.map((part) => {
            part = part.trim();
            if (soundClasses.hasOwnProperty(part)) {
                return soundClasses[part];
            }
            if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
                return escapeRegExp(part.slice(1, -1));
            }
            return undefined;
        }).filter(Boolean).join("");

        regexes.push(shapeRegex)
    }

    return regexes;
}

async function performSearch(query) {
    try {
        const collection = client.db(dbName).collection("common")
        return await collection.find(query).toArray()
    }
    catch (e) {
        return []
    }
}

module.exports = {resultsRoutes: router};
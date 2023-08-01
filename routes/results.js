const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const fs = require("fs");

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

async function performSearch(query, collection_name) {
    try {
        const collection = client.db(dbName).collection(collection_name)
        return await collection.find(query).toArray()
    }
    catch (e) {
        return []
    }
}

const linguisticFeatures = {
    "#": '\\b',
    "[stop]": '(?:pʰ|bʰ|tʰ|dʰ|ḱʰ|ǵʰ|kʰ|gʰ|kʷʰ|T|K|k\'ʰ|ǵʰ|ǵ\'|kʷ|gʷʰ|g\')',
    "[fricative]": '(?:h₁|h₂|h₃|H|hₓ|s|z|F)',
    "-": "(?:[a-zA-Z]+)",
    glide: 'regex_glide',
    T: 'regex_T',
    K: 'regex_K',
    H: 'regex_H',
    // Add more linguistic features as needed
};
// endregion

router.get('/', async (req, res) => {
    // Perform the database query to retrieve search results
    let searchResults = []
    if (req.query.search || req.query.search === ""){
        const query = { meaning: { $regex: req.query.search, $options: 'i' } }
        searchResults = await performSearch(query, "common");
    }else{
        searchResults = await newAdvancedSearch(req.query);
    }
    // if there is a single result, we redirect to it
    if(searchResults.length === 1){
        res.redirect(`/dictionary/${encodeURIComponent(searchResults[0].entry_id)}`);
        return
    }

    // Render the search results page
    res.render('results', { results: searchResults });
});

function patternedRegex(pseudoRegex) {
    const path = "private/regex.json"
    const data = fs.readFileSync(path)
    const linguisticDict = JSON.parse(data)
    // Create a regex pattern to search for keys in the dictionary
    const keysPattern = Object.keys(linguisticDict).map(escapeRegExp).join('|');
    const pattern = new RegExp(`(${keysPattern})`, 'g')
    const regexArray = pseudoRegex
        .split('OR')
        .map((item) => item.trim())
        .map((item) => item.replace(pattern, (match) => linguisticDict[match]))
        .map((item) => `(?:${item})`)
    const completedRegex = `${regexArray.join('|')}`
    return completedRegex
}

async function newAdvancedSearch(data) {
    const regex = patternedRegex(data["rootSearchPatterned"])
    const query = {"searchable_roots": {"$regex": regex}}
    // todo: these results are for the pokorny table, which technically is not the same as the common table. I need to switch that out.
    let results = await performSearch(query, "pokorny")
    return results
}

async function advancedSearch(data) {
    console.log(data)
    // separate queries are needed for each of the possible categories

    // todo: I have no idea what word shape refers to
    let categoryQuery = []
    let regexes = []
    regexes.push(patternedRegex(data["rootSearchPatterned"]))
    console.log(regexes)

    if(data['checkRoots']){
        console.log("checking the roots")
        categoryQuery.push(mapRegexes("root", regexes))
    }
    if(data['checkWords']){
        // todo: I have no idea what this means
        console.log("checking the words")
    }
    if(data['checkMeanings']){
        console.log("checking the meanings")
        categoryQuery.push(mapRegexes("meaning", regexes))
    }
    // todo: this one requires searching differently
    if(data['checkDerivatives']){
        console.log("checking the derivatives")
        // orQuery.push({meaning: shapedQuery})
    }

    let query = {$or: categoryQuery}
    console.log(JSON.stringify(query))
    return performSearch(query)
}

module.exports = {resultsRoutes: router};
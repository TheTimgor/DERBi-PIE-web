const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const fs = require("fs");

const uri = 'mongodb://localhost:27017';
const dbName = 'DERBI-PIE';
const client = new MongoClient(uri);

// region helpers
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

async function performSearch(query, collection_name) {
    try {
        const collection = client.db(dbName).collection(collection_name)
        console.log(JSON.stringify(query))
        return await collection.find(query).toArray()
    }
    catch (e) {
        return []
    }
}

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
    return `${regexArray.join('|')}`
}
// endregion

router.get('/', async (req, res) => {
    try {
        let queryString = req.originalUrl.split('?')[1];
        let special = false
        // special case when you just go to results
        if (queryString === undefined) {
            queryString = "search="
            req.query = {'search': '', 'submit': 'normal'}
            special = true
        }
        console.log(req.query)
        let searchResults = await getResults(req.query)

        // if there is a single result, we redirect to it
        if (searchResults.length === 1) {
            res.redirect(`/dictionary/${encodeURIComponent(searchResults[0].entry_id)}`);
            return
        }

        // Render the search results page
        res.render('results', {results: searchResults, queryString: queryString ? `?${queryString}` : '', renderIndex: special});
    }
    catch (error) {
        console.error(error)
        res.render('results', {results: [], queryString: ''});
    }
});

async function getResults(data){
    // Perform the database query to retrieve search results
    let searchResults = []

    // switch between a regular search and an advanced search. regular search is default.
    if (data && data.submit && data.submit === "advanced"){
        searchResults = await newAdvancedSearch(data);
    }else{
        let rootQuery = getPatternedRootQuery(data["search"])
        let rootMeaningQuery = getRootMeaningQuery(data["search"])
        let query = {"$or": [rootQuery, rootMeaningQuery]}
        searchResults = await performSearch(query, "pokorny");
    }

    return searchResults
}

// region search functions
async function newAdvancedSearch(data) {
    // these are technically specific to pokorny, so new dictionaries collections need to either match the format, or have custom functions for their own queries
    let rootQuery = getPatternedRootQuery(data["rootSearchPatterned"])
    let reflexQuery = getReflexMeaningQuery(data["reflexMeaningSearch"])
    let rootMeaningQuery = getRootMeaningQuery(data["rootMeaningSearch"])
    let semanticQuery = getSemanticQuery(data["semanticKeywordSearch"])

    // the combined query, currently just ANDs them all together, getting only the things in common.
    // todo: May want to eventually add a check box or something to make it an OR query.
    let query = {"$and": [rootQuery, reflexQuery, rootMeaningQuery, semanticQuery]}

    // todo: these results are for the pokorny table, which technically is not the same as the common table. I need to switch that out when another db gets added.
    let results = await performSearch(query, "pokorny")
    return results
}

function getPatternedRootQuery(searchPattern) {
    if (searchPattern === ""){
        return {}
    }
    console.log("~~~~~")
    // console.log(recomposeRegex(searchPattern, patternedRegex))
    console.log(searchPattern)
    console.log("~~~~~")
    // query for searching roots, needs to be ignored if there are no searched roots
    const regex = patternedRegex(searchPattern)
    return {"searchable_roots": {"$regex": regex}}
}

function getReflexMeaningQuery(searchString) {
    if (searchString === ""){
        return {}
    }
    const searchRegex = escapeRegExp(searchString)
    return {"reflexes": {$elemMatch: {"gloss": {"$regex": searchRegex, "$options": "i"}}}}
}

function getRootMeaningQuery(searchString) {
    if (searchString === ""){
        return {}
    }
    const searchRegex = escapeRegExp(searchString)
    return {"meaning": {"$regex": searchRegex, "$options": "i"}}
}

function getSemanticQuery(searchString) {
    if (searchString === ""){
        return {}
    }
    const searchRegex = escapeRegExp(searchString)
    console.log(searchRegex)
    // todo: The semantic field is never filled in, which means I cannot test this. I dont even know what it is going to look like.
    return {"semantic": {$elemMatch: {"$regex": searchRegex, "$options": "i"}}}
}
// endregion

module.exports = {resultsRoutes: router, getResults};
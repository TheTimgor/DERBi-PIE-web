const pluginInterface = require("../../core/pluginInterface")
const fs = require("fs");

// advanced search needs to implement only the search related methods
class advancedSearch extends pluginInterface {
    constructor() {
        super();
        this.name = "Advanced Search"
    }

    searchFields() {
        return [
            {
                "id": "rootSearchPatterned", // string: the id of the element
                "type": "text", // string: checkbox, number, text. todo: make sure radio is actually compatible
                "label": "Patterned Root Search", // string: human readable label
                "name": "rootSearchPatterned", // string: way to identify which result is which
                "value": "", // todo: I think only used for radio
                "placeholder": "Pattern", // placeholder for where that applies
            },
            {
                "id": "reflexSearch",
                "type": "text",
                "label": "Reflex Search",
                "name" : "reflexSearch",
                "value": "",
                "placeholder": "Enter Reflex",
            },
            {
                "id": "reflexMeaningSearch",
                "type": "text",
                "label": "Reflex Meaning Search",
                "name" : "reflexMeaningSearch",
                "value": "",
                "placeholder": "Enter keywords",
            },
            {
                "id": "rootMeaningSearch",
                "type": "text",
                "label": "Root Meaning Search",
                "name" : "rootMeaningSearch",
                "value": "",
                "placeholder": "Enter keywords",
            },
            {
                "id": "semanticKeywordSearch",
                "type": "text",
                "label": "Semantic Keyword Search",
                "name" : "semanticKeywordSearch",
                "value": "",
                "placeholder": "Enter keywords",
            },
            // ... as many as needed, ordering matters for display
        ]
    }

    searchProcessing(searchObj) {
        // these are technically specific to pokorny, so new dictionaries collections need to either match the format, or have custom functions for their own queries
        let rootQuery = getPatternedRootQuery(searchObj["rootSearchPatterned"])
        let reflexQuery = getReflexQuery(searchObj["reflexSearch"])
        let reflexMeaningQuery = getReflexMeaningQuery(searchObj["reflexMeaningSearch"])
        let rootMeaningQuery = getRootMeaningQuery(searchObj["rootMeaningSearch"])
        let semanticQuery = getSemanticQuery(searchObj["semanticKeywordSearch"])

        // the combined query, currently just ANDs them all together, getting only the things in common.
        return {"$and": [rootQuery, reflexQuery, reflexMeaningQuery, rootMeaningQuery, semanticQuery]}
    }
}

// region helpers
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function patternedRegex(pseudoRegex) {
    const path = "./data/regex.json"
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

// region search functions

function getPatternedRootQuery(searchPattern) {
    if (searchPattern === ""){
        return {}
    }
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

function getReflexQuery(searchString) {
    if (searchString === ""){
        return {}
    }
    const searchRegex = escapeRegExp(searchString)
    return {"reflexes": {$elemMatch: {"reflexes": {$elemMatch: {"$regex": searchRegex, "$options": "i"}}}}}
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

module.exports = advancedSearch
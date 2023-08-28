const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'DERBI-PIE';
const client = new MongoClient(uri);


router.get('/:entry_id', async (req, res) => {
    const entry_id = req.params.entry_id;

    const query = {entry_id}

    const commonCollection = client.db(dbName).collection("common")
    const dictionaryEntry = await commonCollection.findOne(query)

    const pokornyCollection = client.db(dbName).collection("pokorny")
    const pokornyEntry = await pokornyCollection.findOne(query)

    // process the reflexes
    let categorized = {}
    if(pokornyEntry && pokornyEntry.reflexes) {
        pokornyEntry.reflexes = expandSources(pokornyEntry.reflexes)
        categorized = categorizeReflexesByLanguage(pokornyEntry.reflexes)
    }


    // Render the dictionary entry template and pass the data
    res.render('dictionary', { entry: dictionaryEntry, dictionaries: [{data: pokornyEntry, categorizedReflexes: categorized}]});
});


function expandSources(reflexes) {
    for(let i in reflexes){
        let combinedSources = new Set();
        for(let source of reflexes[i].source.text_sources){
            combinedSources.add(JSON.stringify(source))
        }
        for(let source of reflexes[i].source.db_sources){
            combinedSources.add(JSON.stringify(source))
        }
        combinedSources = Array.from(combinedSources).map(JSON.parse);
        reflexes[i].combinedSources = combinedSources
    }
    return reflexes
}


function categorizeReflexesByLanguage(reflexes) {
    const categorizedObjects = {};

    reflexes.forEach(entry => {
        const languageFamily = entry.language.family_name;
        const subFamilyName = entry.language.sub_family_name;

        if (!categorizedObjects[languageFamily]) {
            categorizedObjects[languageFamily] = {};
        }

        if (!categorizedObjects[languageFamily][subFamilyName]) {
            categorizedObjects[languageFamily][subFamilyName] = [];
        }

        categorizedObjects[languageFamily][subFamilyName].push(entry);
    });
    return categorizedObjects;
}

module.exports = router;
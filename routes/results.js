const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'DERBI-PIE';
const client = new MongoClient(uri);

router.get('/', async (req, res) => {
    // Perform the database query to retrieve search results
    const searchResults = await performSearch(req.query.search);
    // if there is a single result, we redirect to it
    if(searchResults.length === 1){
        res.redirect(`/dictionary/${encodeURIComponent(searchResults[0].entry_id)}`);
        return
    }

    // Render the search results page
    res.render('results', { results: searchResults });
});

async function performSearch(word) {
    const query = { meaning: { $regex: word, $options: 'i' } };
    try {
        const test = new RegExp(word)
        const collection = client.db(dbName).collection("common")
        return await collection.find(query).toArray()
    }
    catch (e) {
        return []
    }
}

module.exports = {resultsRoutes: router};
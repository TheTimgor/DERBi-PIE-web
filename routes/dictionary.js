const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'DERBI-PIE';
const client = new MongoClient(uri);


router.get('/:entry_id', async (req, res) => {
    const entry_id = req.params.entry_id;

    const query = {entry_id}

    const collection = client.db(dbName).collection("common")
    const dictionaryEntry = await collection.findOne(query)

    console.log(dictionaryEntry)

    // Render the dictionary entry template and pass the data
    res.render('dictionary', { entry: dictionaryEntry});
});

module.exports = router;
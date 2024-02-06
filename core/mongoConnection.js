const {MongoClient} = require("mongodb");


const uri = 'mongodb://localhost:27017';
const dbName = 'DERBI-PIE';
const client = new MongoClient(uri);

module.exports = {dbName, client}
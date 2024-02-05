const express = require('express');
const router = express.Router();
const pluginManager = require('../pluginManager');

// Define the route to display the search form
router.get('/', (req, res) => {
    let searchData = pluginManager.getSearchFields()
    console.log("search", searchData)
    res.render('search', { searchData });
});

module.exports = router;

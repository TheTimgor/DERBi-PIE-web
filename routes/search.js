const express = require('express');
const router = express.Router();

// Define the route to display the search form
router.get('/', (req, res) => {
    res.render('search');
});

module.exports = router;

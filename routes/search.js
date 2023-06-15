const express = require('express');
const router = express.Router();

// Define the route to display the search form
router.get('/', (req, res) => {
    res.render('search');
});

// Define the route to handle the search form submission
router.post('/search', (req, res) => {
    const searchTerm = req.body.searchTerm;
    // Replace the following line with your actual search logic
    res.redirect(`/results?search=${encodeURIComponent(searchTerm)}`);
});

module.exports = router;

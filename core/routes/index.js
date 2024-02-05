const express = require('express');
const router = express.Router();

/* go to the search by default. */
router.get('/', function(req, res, next) {
  res.redirect('/search');
});

module.exports = router;

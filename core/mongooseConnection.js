const mongoose = require('mongoose');

function connect(){
    mongoose.connect('mongodb://localhost:27017/DERBI-PIE', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
}

module.exports = {connect}
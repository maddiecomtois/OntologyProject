const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var rdfstore = require('rdfstore');


const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 4000;

const server = app.listen(port, function(){
    console.log('Listening on port ' + port);
});

new rdfstore.Store(function(err, store) {
  // the new store is ready
});

module.exports = app;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var rdfstore = require('rdfstore');
var fs = require('fs');
const cors = require('cors');

// set up Express
const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 4000;

const server = app.listen(port, function() {
  console.log('Listening on port ' + port);
});

// list of queries to test
var queries = {
  1: "SELECT * WHERE { ?s ?p ?o } LIMIT 1",
  2: "SELECT * WHERE { ?s ?p ?o } LIMIT 2",
  3: "SELECT * WHERE { ?s ?p ?o } LIMIT 3",
  4: "SELECT * WHERE { ?s ?p ?o } LIMIT 4",
  5: "SELECT * WHERE { ?s ?p ?o } LIMIT 5",
  6: "SELECT * WHERE { ?s ?p ?o } LIMIT 6",
  7: "SELECT * WHERE { ?s ?p ?o } LIMIT 7",
  8: "SELECT * WHERE { ?s ?p ?o } LIMIT 8",
  9: "SELECT * WHERE { ?s ?p ?o } LIMIT 9",
  10: "SELECT * WHERE { ?s ?p ?o } LIMIT 10",
}

// convert rdf data file into a string
var rdf = fs.readFileSync('CovidCountyStatistics.ttl').toString();

// create an instance of an rdf store to search
var store = rdfstore.create(function(err, store) {});

// return the sparql result from one of the listed queries (query identifed by number from client end)
app.get('/getQueryResponse/:queryId', (req, res) => {
  // load the data string into the store
  store.load('text/turtle', rdf, function(err) {
    if (!err) {
      // execute the query and return the response
      store.execute(queries[req.params.queryId], function(success, results) {
        res.json(results);
      });
    }
    else {
      res.json(err);
    }
  });
});

module.exports = app;
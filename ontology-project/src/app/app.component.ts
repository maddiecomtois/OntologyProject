import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  // array to store query responses from GraphDB
  queryResponses: any[] = [];
  
  // array to store the titles of the projected variables queried
  queryHeaders: String[] = [];
  
  // message if no resulting triples are found
  message: string = "No resulting triples were found";
  
  // boolean to check if request to GraphDB was received
  requestReceived: boolean = true;
  
  // url to connect to graphDB
  //graphDBurl = 'http://localhost:7200/repositories/OntologyProject';
  graphDBurl = 'http://localhost:7200/repositories/test';
  
  // list of prefixes for SPARQL queries
  prefixes = `PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
              PREFIX entertainment: <http://www.example.com/ns#>
              PREFIX dbpr: <https://dbpedia.org/resource/>`;
    
  // holds any user input query          
  queryInput: string = "";
  
  // SPARQL queries to test
  query1 = "SELECT DISTINCT ?title WHERE {?media rdf:type ?type;entertainment:title ?title;entertainment:provider entertainment:Netflix, entertainment:DisneyPlus;entertainment:addedToNetflix ?date.FILTER(?date > \"2019-01-01T00:00:00Z\"^^xsd:dateTime)FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow))}";
  query2 = "SELECT ((?netflixUS* 100 / ?netflixAll) as ?totalNetflix) ((?disneyUS* 100 / ?disneyAll) as ?totalDisney) WHERE{ {SELECT DISTINCT (COUNT(*) AS ?netflixUS) WHERE { ?movie rdf:type ?type; entertainment:provider entertainment:Netflix; entertainment:country dbpr:United_States. FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow))}}{SELECT DISTINCT (COUNT(*) AS ?netflixAll) WHERE { ?movie rdf:type ?type; entertainment:provider entertainment:Netflix. FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow))}}{SELECT DISTINCT (COUNT(*) AS ?disneyUS) WHERE { ?movie rdf:type ?type; entertainment:provider entertainment:DisneyPlus; entertainment:country dbpr:United_States. FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow))}}{SELECT DISTINCT (COUNT(*) AS ?disneyAll) WHERE { ?movie rdf:type ?type; entertainment:provider entertainment:DisneyPlus. FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow))}}}";
  query3 = "SELECT DISTINCT ?director WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title1; entertainment:provider entertainment:Netflix; entertainment:director ?director. ?movie2 rdf:type entertainment:Movie; entertainment:title ?title2; entertainment:provider entertainment:DisneyPlus; entertainment:director ?director. FILTER(?title1 != ?title2)}";
  query4 = "SELECT ?topNetflixRating ?topDisneyRating WHERE { { SELECT ?topNetflixRating WHERE { BIND(?rating AS ?topNetflixRating) ?media rdf:type ?type; entertainment:title ?title; entertainment:provider entertainment:Netflix; entertainment:rating ?rating; entertainment:country dbpr:United_States. FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow)) } GROUP BY ?topNetflixRating ?title ORDER BY DESC (COUNT(?title)) LIMIT 1 } UNION { SELECT ?topDisneyRating WHERE { BIND(?rating AS ?topDisneyRating) ?media rdf:type ?type; entertainment:title ?title; entertainment:provider entertainment:DisneyPlus; entertainment:rating ?rating; entertainment:country dbpr:United_States. FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow)) } GROUP BY ?topDisneyRating ?title ORDER BY DESC (COUNT(?title)) LIMIT 1 }}";
  query5 = "SELECT (AVG(?netflixDuration) AS ?nDuration) (AVG(?disneyDuration) AS ?dDuration) WHERE { { SELECT ?netflixDuration WHERE { ?movie rdf:type entertainment:Movie; entertainment:provider entertainment:Netflix; entertainment:duration ?netflixDuration. } } UNION { SELECT ?disneyDuration WHERE { ?movie rdf:type entertainment:Movie; entertainment:provider entertainment:DisneyPlus; entertainment:duration ?disneyDuration. } }}";
  query6 = "SELECT DISTINCT ?title ?revenue WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title; entertainment:provider entertainment:DisneyPlus; entertainment:rating \"G\"; entertainment:revenue ?revenue.}ORDER BY DESC (?revenue)LIMIT 10";
  query7 = "SELECT DISTINCT ?title ?director WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title; entertainment:provider entertainment:DisneyPlus; entertainment:director ?director; entertainment:budget ?budget. FILTER(?budget < 4000000 )}GROUP BY ?movie ?title ?director HAVING (count(distinct ?director) = 1)";
  query8 = "SELECT DISTINCT ?title ?imdbRating WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title; entertainment:provider entertainment:Netflix; entertainment:addedToNetflix ?date; entertainment:imdbRating ?imdbRating. FILTER(?date > \"2021-01-01T00:00:00Z\"^^xsd:dateTime) FILTER(?imdbRating > \"9.0\"^^xsd:decimal)}";
  query9 = "SELECT ?title ?rating WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title; entertainment:provider entertainment:DisneyPlus; entertainment:tomatoRating ?rating; entertainment:duration ?duration. FILTER(?duration >= 100 )}GROUP BY ?rating ?title ORDER BY DESC (?rating)LIMIT 5";
  query10 = "SELECT ?title ?rating ?budget WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title; entertainment:provider entertainment:DisneyPlus; entertainment:budget ?budget; entertainment:imdbRating ?rating. FILTER(?budget < 2000000 )}GROUP BY ?rating ?title ?budget ORDER BY DESC (?rating) LIMIT 1";

  
  constructor(private http: HttpClient) {}

  // function called on loading component; sets up the collapsible queries
  ngOnInit() {
    var coll = document.getElementsByClassName("collapsible");
    for (let i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
  }
  
  // constructs a sparql query based on the selected query or input and get results
  getQueryResponse(queryId) {
    const query = `${this.prefixes} ` + `${queryId}`;

    this.sendQuery(query).subscribe( (res) => {
      this.parseResults(res);
    });
  }
  
  // sends constructed sparql query to graphDB, return raw results
  sendQuery(query: string): Observable<any[]> {
    this.requestReceived = false;
    const params = new HttpParams()
        .set('query', query)
        .set('format', 'json');
      const options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/sparql-results+json'
        }),
        params: params
      };
      return this.http.get<any>(this.graphDBurl, options);
  }
  
  // parse the results of the sparql query
  parseResults(results: any) {
    this.queryResponses = [];
    let result: any;
    let resultEntry: any = {};

    // get the response projected values to display as table headers
    this.queryHeaders = results.head.vars;
    
    // loop through each returned result
    for (result of results.results.bindings) {
      // loop through the result's projected names and values (filters out url and datatype attributes)
      Object.entries(result).forEach(
        ([key, val]: any) => {
          resultEntry[key] = val.value;
        }
      );
      
      // add filtered resonse to array and reset
      this.queryResponses.push(resultEntry);
      resultEntry = {};
    }

    console.log("Query responses: ", this.queryResponses);
    /*
    for(let i = 0; i < this.queryResponses.length; i++) {
      Object.entries(this.queryResponses[i]).forEach(
        ([key, val]) => {
          for(let j = 0; j < this.queryHeaders.length; j++) {
            console.log("query header: ", this.queryHeaders[j], "\tkeyval: ", key, val)
          }
        }
      )
    }
    */
    this.requestReceived = true;

  }
  
  // reset the table data
  clearData() {
    this.requestReceived = false;
    this.queryResponses = [];
    this.requestReceived = true;
  }
}

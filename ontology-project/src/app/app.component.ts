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
  
  // messages to inform the user of interface status
  noResultsMessage: string = "No resulting triples were found";
  loadingMessage: string = "...Loading";
  
  // booleans to check if request to GraphDB was received or loading
  requestReceived: boolean = true;
  loading: boolean = false;
  
  // url to connect to graphDB
  graphDBurl = 'http://localhost:7200/repositories/OntologyProject';
  
  // list of prefixes for SPARQL queries
  prefixes = `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX entertainment: <http://www.example.org/entertainment/>
PREFIX dbpr: <http://dbpedia.org/resource/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>`;
    
  // holds any user input query          
  queryInput: string = "";
  
  // SPARQL queries to test
  query1 = "SELECT DISTINCT ?title WHERE { ?media rdf:type ?type; entertainment:title ?title; entertainment:addedToNetflix ?date; entertainment:provider dbpr:Netflix; entertainment:provider dbpr:DisneyPlus; FILTER(?date > \"2019-01-01T00:00:00Z\"^^xsd:dateTime) FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow))}";
  query2 = "SELECT ((?netflixUS* 100 / ?netflixAll) as ?totalNetflix) ((?disneyUS* 100 / ?disneyAll) as ?totalDisney) WHERE{ {SELECT DISTINCT (COUNT(*) AS ?netflixUS) WHERE { ?movie rdf:type ?type; entertainment:provider dbpr:Netflix; entertainment:country \"United States\". FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow))}}{SELECT DISTINCT (COUNT(*) AS ?netflixAll) WHERE { ?movie rdf:type ?type; entertainment:provider dbpr:Netflix. FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow))}}{SELECT DISTINCT (COUNT(*) AS ?disneyUS) WHERE { ?movie rdf:type ?type; entertainment:provider dbpr:DisneyPlus; entertainment:country \"United States\". FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow))}}{SELECT DISTINCT (COUNT(*) AS ?disneyAll) WHERE { ?movie rdf:type ?type; entertainment:provider dbpr:DisneyPlus. FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow))}}}";
  query3 = "SELECT DISTINCT ?title1 ?director WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title1; entertainment:provider dbpr:Netflix; entertainment:director ?director. ?movie2 rdf:type entertainment:Movie; entertainment:title ?title2; entertainment:provider dbpr:DisneyPlus; entertainment:director ?director. FILTER(?title1 != ?title2)}";
  query4 = "SELECT ?topNetflixRating ?topDisneyRating WHERE { { SELECT ?topNetflixRating WHERE { BIND(?rating AS ?topNetflixRating) ?media rdf:type ?type; entertainment:title ?title; entertainment:provider dbpr:Netflix; entertainment:rating ?rating; entertainment:country \"United States\". FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow)) } GROUP BY ?topNetflixRating ?title ORDER BY DESC (COUNT(?title)) LIMIT 1 } UNION { SELECT ?topDisneyRating WHERE { BIND(?rating AS ?topDisneyRating) ?media rdf:type ?type; entertainment:title ?title; entertainment:provider dbpr:DisneyPlus; entertainment:rating ?rating; entertainment:country \"United States\". FILTER((?type = entertainment:Movie) || (?type = entertainment:TVShow)) } GROUP BY ?topDisneyRating ?title ORDER BY DESC (COUNT(?title)) LIMIT 1 }}";
  query5 = "SELECT (AVG(?netflixDuration) AS ?nDuration) (AVG(?disneyDuration) AS ?dDuration) WHERE { { SELECT ?netflixDuration WHERE { ?movie rdf:type entertainment:Movie; entertainment:provider dbpr:Netflix; entertainment:duration ?netflixDuration. } } { SELECT ?disneyDuration WHERE { ?movie rdf:type entertainment:Movie; entertainment:provider dbpr:DisneyPlus; entertainment:duration ?disneyDuration. } }}";
  query6 = "SELECT DISTINCT ?title ?revenue WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title; entertainment:provider dbpr:DisneyPlus; entertainment:rating \"G\"; entertainment:revenue ?revenue.}ORDER BY DESC (?revenue)LIMIT 10";
  query7 = "SELECT DISTINCT ?title ?director WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title; entertainment:provider dbpr:DisneyPlus; entertainment:director ?director; entertainment:budget ?budget. FILTER(?budget < 4000000 ) FILTER (!regex(?director, \",\"))}";
  query8 = "SELECT DISTINCT ?title ?imdbRating WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title; entertainment:provider dbpr:Netflix; entertainment:addedToNetflix ?date; entertainment:imdbRating ?imdbRating. FILTER(?date > \"2021-01-01T00:00:00Z\"^^xsd:dateTime) FILTER(?imdbRating > 8.0)}";
  query9 = "SELECT ?title ?duration ?rating WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title; entertainment:provider dbpr:DisneyPlus; entertainment:rottenTomatoesRating ?rating; entertainment:duration ?duration. FILTER(?duration >= 100 )} GROUP BY ?rating ?duration ?title ORDER BY DESC (?rating) LIMIT 5";
  query10 = "SELECT ?title ?rating ?budget WHERE { ?movie rdf:type entertainment:Movie; entertainment:title ?title; entertainment:provider dbpr:DisneyPlus; entertainment:budget ?budget; entertainment:imdbRating ?rating. FILTER(?budget < 2000000 )}GROUP BY ?rating ?title ?budget ORDER BY DESC (?rating) LIMIT 1";

  
  constructor(private http: HttpClient) {}

  // function called on loading component; sets up the collapsible queries html
  ngOnInit() {
    let queryStatementBox = document.getElementsByClassName("collapsible");
    for (let i = 0; i < queryStatementBox.length; i++) {
      queryStatementBox[i].addEventListener("click", function() {
        this.classList.toggle("active");
        let queryCodeBox = this.nextElementSibling;
        if (queryCodeBox.style.display === "block") {
          queryCodeBox.style.display = "none";
        } else {
          queryCodeBox.style.display = "block";
        }
      });
    }
  }
  
  // constructs a sparql query based on the selected query or input and get results
  getQueryResponse(queryId) {
    const query = `${this.prefixes} ` + `${queryId}`;

    this.loading = true;
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
      // loop through the result's projected names and values (i.e. filter out associated url and datatype attributes)
      Object.entries(result).forEach(
        ([key, val]: any) => {
          resultEntry[key] = val.value;
        }
      );
      
      // add filtered resonse to array and reset
      this.queryResponses.push(resultEntry);
      resultEntry = {};
    }

    this.loading = false;
    this.requestReceived = true;

  }
  
  // reset the table data
  clearData() {
    this.queryResponses = [];
    this.requestReceived = true;
  }
}

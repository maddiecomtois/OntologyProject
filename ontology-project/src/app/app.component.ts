import { Component, OnInit } from '@angular/core';
import { AppServiceService } from './app-service.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  // array to store query responses from server
  queryResponses: QueryResult[] = [];
  
  // array to store the variables queried
  queryHeaders: String[] = [];
  
  // url to connect to graphDB
  graphDBurl = 'http://localhost:7200/repositories/OntologyProject';
  
  // list of prefixes for SPARQL queries
  prefixes = `PREFIX wine: <http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#>`;
  
  // SPARQL queries to test
  query1 = "SELECT * WHERE { ?s ?p ?o } LIMIT 1";
  query2 = "SELECT * WHERE { ?s ?p ?o } LIMIT 2";
  query3 = "SELECT * WHERE { ?s ?p ?o } LIMIT 3";
  query4 = "SELECT * WHERE { ?s ?p ?o } LIMIT 4";
  query5 = "SELECT * WHERE { ?s ?p ?o } LIMIT 5";
  query6 = "SELECT * WHERE { ?s ?p ?o } LIMIT 6";
  query7 = "SELECT * WHERE { ?s ?p ?o } LIMIT 7";
  query8 = "SELECT * WHERE { ?s ?p ?o } LIMIT 8";
  query9 = "SELECT * WHERE { ?s ?p ?o } LIMIT 9";
  query10 = "SELECT * WHERE { ?s ?p ?o } LIMIT 10";
  query11 = "select * where {?s wine:locatedIn/wine:locatedIn* ?o .} limit 5"
  queryInput: string = "";
  
  constructor( private service : AppServiceService, private http: HttpClient) {}

  
  // function that gets called on loading component (can delete later if don't use)
  ngOnInit() {
    
  }
  
  // constructs a sparql query based on the button pressed and get results
  getQueryResponse(queryId) {
    const query = `${this.prefixes} ` + `${queryId}`;

    this.sendQuery(query).subscribe( (res) => {
      this.parseResults(res);
    });
  }
  
  // sends constructed sparql query to graphDB
  sendQuery(query: string): Observable<any[]> {
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
    let result: any;
    this.queryResponses = [];
    let resultEntry: QueryResult;

    let s: string;
    let o: string;
    let p: string;
    
    this.queryHeaders = Object.keys(results.results.bindings[0]);
    
    for (result of results.results.bindings) {
      s = result.s ? result.s.value : null;
      o = result.o ? result.o.value : null;
      p = result.p ? result.p.value : null;
      
      resultEntry = new QueryResult();
      resultEntry.s = s;
      resultEntry.o = o;
      resultEntry.p = p;
      this.queryResponses.push(resultEntry);
    }
    console.log("Query responses: ", this.queryResponses);
  }
  
  // send whichever query to server based on which button was pressed
  /*
  sendQuery(queryId) {
    this.queryResponses = [];
    // call function in service file to send/get data over http
    this.service.getQueryResponse(queryId).subscribe((res: Query[]) => {
      for(let i = 0; i < res.length; i++) {
        this.queryResponses.push(res[i]);
      }
      console.log(this.queryResponses);
    });
  }  
  */
}

// class to store the different attributes of a query response
export class QueryResult {
    s: Object;
    o: Object;
    p: Object;
}

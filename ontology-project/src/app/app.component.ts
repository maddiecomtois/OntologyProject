import { Component, OnInit } from '@angular/core';
import { AppServiceService } from './app-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  // array to store query responses from server
  queryResponses: Query[] = [];
  
  // query string options displayed on the buttons
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
  
  constructor( private service : AppServiceService) {}
  
  // function that gets called on loading component (can delete later if don't use)
  ngOnInit() {
    console.log("component loaded");
  }
  
  // send whichever query to server based on which button was pressed
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
}

// class to store the different attributes of a query response
export class Query {
    s: Object;
    o: Object;
    p: Object;
}

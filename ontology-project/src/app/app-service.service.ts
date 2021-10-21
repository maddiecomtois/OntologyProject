import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {

  constructor(public http: HttpClient) { }
  
  // call the getQueryResponse endpoint on the server with the id of the query to run
  getQueryResponse(queryId) {
    return this.http.get("http://localhost:4000/getQueryResponse/" + queryId);
  }
}

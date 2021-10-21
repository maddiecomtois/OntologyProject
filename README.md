# OntologyProject

## About  
This project is set up using the Angular framework on the front end and a Node/express server on the backend.  The npm module ```rdfstore``` is used to load in triple stores and parse queries with SPARQL.

## Installation and Setup
When installing for the first time, add the node modules since these are part of .gitignore   
```/ontology-project $ npm i```

Start the server from the api folder with node (localhost:4000)  
```/ontology-project/api $ node server.js```


Start the front end with ng (localhost:4200)  
```/ontology-project/src/app $ ng serve```

Open a browser window and connect to ```localhost:4200``` to see the interface.

## Organisation
### Backend 
The code for the backend is stored in the  ```ontology-project/api``` folder.  This folder contains a sample ```.ttl``` file for testing rdf stores as well as the file ```server.js``` for running the server.

### Frontend
The main code for the user interface is stored in the ```ontology-project/src/app``` folder.  The other files in the ```/src``` folder are for setting up the environment.  The app folder contains the following files:

- ```app-service.service.ts```: This file contains a function that sends and receives data from the front end and back end over http (i.e. connects data to and from app.component.ts and server.js)
- ```app.component.css```: This file contains the css code for the interface
- ```app.component.html```: This file contains the html code for the interface
- ```app.component.ts```: This file contains the functionality of the code displayed in html file / seen in the browser 
- ```app.module.ts```: This file takes care of imports and declarations
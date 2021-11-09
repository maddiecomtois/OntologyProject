# OntologyProject

## About  
This project is set up using the Angular framework and connecting to a local instance the GraphDB RDF store.  Users send queries, either by selecting pre-written queries or writing their own, to GraphDB and view the returned results.

## Installation and Setup
When installing for the first time, add the node modules since these are part of .gitignore   
```~/ontology-project $ npm i```

Start the front end with ng (localhost:4200)  
```~/ontology-project/src/app $ ng serve```


Create a Repsitory on GraphDB with the name ```OntologyProject```.  Then upload the turtle files and owl file.  The repository should be hosted with the url ```http://localhost:7200/repositories/OntologyProject```



Open a browser window and connect to ```localhost:4200``` to see the interface.

## Organisation

### Frontend Code
The main code for the user interface is stored in the ```ontology-project/src/app``` folder.  The other files in the ```/src``` folder are for setting up the environment.  The app folder contains the following files:


- ```app.component.css```: This file contains the css code for the interface
- ```app.component.html```: This file contains the html code for the interface
- ```app.component.ts```: This file contains the functionality of the code displayed in html file / seen in the browser as well as connecting to GraphDB
- ```app.module.ts```: This file takes care of global imports and declarations
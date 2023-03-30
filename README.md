# Gateways

Simple monolithic project containing an Angular application in the front-end, Node.js back-end and a MongoDB database.

Built with `Angular v14.3` `Node.js v16.13` `MongoDB Community Server v6.0`

## Requirements

`Docker >=20.10`
`docker-compose >=1.25`

## Build

> Optional: Extract `data.tar.gz` file in the root directory. This contains an example MongoDB data.

Run `docker-compose build` to build the docker images.

Run `docker-compose up -d` to run the containers.

After run the containers: 

 - The Angular application will be available at http://localhost:4200 
   
 - The Node.js backend will be available at http://localhost:3000 

 - Swagger definition at http://localhost:3000/docs

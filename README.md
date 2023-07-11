# Eva Case Study API
This API provides endpoints for buying and selling shares, retrieving share quantities, and grouping share counts by symbol.

## Technologies Used
- Node.js
- Express.js
- PostgreSQL (Database)
- Sequelize (ORM)
- Swagger (API Documentation)
- Logging (Winston)
- Prerequisites
#### Before running the application, make sure you have the following prerequisites installed:

- Node.js
- Docker (if running the application with Docker)

## Getting Started
To run the application locally, follow these steps:

### Clone the repository:
```git clone <repository-url>```

### To run the application using Docker, follow these steps:

Install Docker on your machine.

Build the Docker images and run the application by one single command:
```docker-compose up --build```

All of initial data will be migrated along with tables and the API will be accessible at http://localhost:3000.

API Documentation
The API is documented using Swagger. To access the API documentation, open your browser and go to http://localhost:3000/api-docs.

const express = require('express');
const sequelize = require('./db/db');
const routes = require('./routes/routes');
const { Client } = require('./db/models');
const logger = require('./logger');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Configure Swagger options
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Eva Case Study',
            version: '1.0.0',
        },
    },
    apis: ['./routes/routes.js'],
};

// Initialize Swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Define model definitions for Swagger
const modelDefs = {
    Client: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
        },
    },
    Portfolio: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            clientId: { type: 'integer' },
        },
    },
    Share: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            symbol: { type: 'string' },
            price: { type: 'number' },
            companyName: { type: 'string' },
        },
    },
    Trade: {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            type: { type: 'string', enum: ['BUY', 'SELL'] },
            portfolioId: { type: 'integer' },
            shareSymbol: { type: 'string' },
            price: { type: 'number' },
            sharesBought: { type: 'integer' },
            sharesSold: { type: 'integer' },
            tradeDate: { type: 'string', format: 'date-time' },
        },
    },
};

// Add model definitions to the Swagger specification
swaggerSpec.components = { schemas: modelDefs };

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Serve the Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', routes);

// Database synchronization
(async () => {
    try {
        await sequelize.sync();
        const hasData = await checkIfDataExists();

        if (!hasData) {
            // Run the init.js script
            require('./db/init.js');
        }

        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
    }
})();

async function checkIfDataExists() {
    // Check if there is data in the Client model
    const clientCount = await Client.count();

    if (clientCount > 0) {
        logger.info('Data exists in the Client model');
        return true;
    } else {
        logger.info('No data in the Client model');
        return false;
    }
}

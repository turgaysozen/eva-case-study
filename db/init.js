const sequelize = require('./db');
const logger = require('./../logger');

const { Portfolio, Share, Trade, Client } = require('./models');

const clients = [
    { name: 'Client 1', email: 'client1@example.com' },
    { name: 'Client 2', email: 'client2@example.com' },
    { name: 'Client 3', email: 'client3@example.com' },
    { name: 'Client 4', email: 'client4@example.com' },
    { name: 'Client 5', email: 'client5@example.com' },
  ];

const portfolios = [
    { name: 'Portfolio 1', clientId: 1 },
    { name: 'Portfolio 2', clientId: 2 },
    { name: 'Portfolio 3', clientId: 3 },
    { name: 'Portfolio 4', clientId: 4 },
    { name: 'Portfolio 5', clientId: 5 },
];

const shares = [
    { symbol: 'APP', price: 150.50, companyName: 'Apple Inc.' },
    { symbol: 'GOG', price: 2500.75, companyName: 'Alphabet Inc.' },
    { symbol: 'IBM', price: 210.45, companyName: 'IBM Inc.' },
    { symbol: 'TSL', price: 269.15, companyName: 'Tesla Inc.' },
    { symbol: 'NAS', price: 300.55, companyName: 'NASA Inc.' },
];

const trades = [
    { type: 'BUY', portfolioId: 1, shareSymbol: 'APP', price: 150.50, sharesBought: 10, sharesSold: 0, tradeDate: new Date() },
    { type: 'SELL', portfolioId: 2, shareSymbol: 'GOG', price: 2500.75, sharesBought: 0, sharesSold: 5, tradeDate: new Date() },
    { type: 'BUY', portfolioId: 3, shareSymbol: 'IBM', price: 210.45, sharesBought: 2, sharesSold: 0, tradeDate: new Date() },
    { type: 'SELL', portfolioId: 4, shareSymbol: 'TSL', price: 269.15, sharesBought: 0, sharesSold: 4, tradeDate: new Date() },
    { type: 'BUY', portfolioId: 5, shareSymbol: 'NAS', price: 300.55, sharesBought: 2, sharesSold: 0, tradeDate: new Date() },
    { type: 'BUY', portfolioId: 2, shareSymbol: 'GOG', price: 2500.75, sharesBought: 6, sharesSold: 0, tradeDate: new Date() },
    { type: 'BUY', portfolioId: 4, shareSymbol: 'TSL', price: 269.15, sharesBought: 7, sharesSold: 0, tradeDate: new Date() },
];

// Initialize the database with the initial data
sequelize.sync({ force: true })
    .then(() => {
        logger.info('Models synchronized with the database');
        return Promise.all([
            Client.bulkCreate(clients),
            Portfolio.bulkCreate(portfolios),
            Share.bulkCreate(shares),
            Trade.bulkCreate(trades),
        ]);
    })
    .then(() => {
        logger.info('Initial data created in the database');
    })
    .catch((error) => {
        logger.error('Error initializing the database:', error);
    });

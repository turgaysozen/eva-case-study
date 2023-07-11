const express = require('express');
const { Portfolio, Share, Trade } = require('../db/models');
const sequelize = require('../db/db');
const logger = require('./../logger');

const router = express.Router();

/**
 * @swagger
 * /api/sell:
 *   post:
 *     summary: Sell shares
 *     tags:
 *       - Sell
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               portfolioId:
 *                 type: integer
 *               shareSymbol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful sell operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Insufficient stocks for selling
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: An error occurred during the sell operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/sell', async (req, res) => {
    try {
        // Get the required data from the request body
        const { portfolioId, shareSymbol } = req.body;

        // Check if the symbol exists in the shares
        const symbolExists = await Share.findOne({ where: { symbol: shareSymbol } });
        if (!symbolExists) {
            return res.status(400).json({ message: 'Invalid symbol' });
        }

        // Check if the portfolio is registered
        const portfolioExists = await Portfolio.findOne({ where: { id: portfolioId } });
        if (!portfolioExists) {
            return res.status(400).json({ message: 'Unregistered portfolio' });
        }

        // Fetch the latest share price from the database
        const sharePrice = symbolExists.price;
        logger.info("sharePrice:", sharePrice);

        // Get the total shares bought
        const totalSharesBought = await Trade.sum('sharesBought', {
            where: { portfolioId, shareSymbol },
        });

        // Get the total shares sold
        const totalSharesSold = await Trade.sum('sharesSold', {
            where: { portfolioId, shareSymbol },
        });

        // Calculate the available quantity for selling
        const availableQuantity = totalSharesBought - totalSharesSold;

        // Check if there are available stocks for selling
        if (availableQuantity <= 0) {
            return res.status(400).json({ message: 'Insufficient stocks for selling' });
        }

        // Perform the sell operation and update the portfolio
        await Trade.create({
            type: 'SELL',
            portfolioId,
            shareSymbol,
            price: sharePrice,
            sharesBought: 0,
            sharesSold: 1,
            tradeDate: new Date(),
        });

        // Return a success response
        res.status(200).json({ message: 'Sell operation successful' });
    } catch (error) {
        logger.error(error);
        // Return an error response
        res.status(500).json({ message: 'An error occurred during the sell operation' });
    }
});

/**
 * @swagger
 * /api/buy:
 *   post:
 *     summary: Buy shares
 *     tags:
 *       - Buy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               portfolioId:
 *                 type: integer
 *               shareSymbol:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful buy operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '400':
 *         description: Insufficient stocks for buying or other validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: An error occurred during the buy operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/buy', async (req, res) => {
    try {
        // Get the required data from the request body
        const { portfolioId, shareSymbol, price } = req.body;

        // Check if the symbol exists in the shares
        const symbolExists = await Share.findOne({ where: { symbol: shareSymbol } });
        if (!symbolExists) {
            return res.status(400).json({ message: 'Invalid symbol' });
        }

        // Check if the portfolio is registered
        const portfolioExists = await Portfolio.findOne({ where: { id: portfolioId } });
        if (!portfolioExists) {
            return res.status(400).json({ message: 'Unregistered portfolio' });
        }

        // Perform the buy operation and update the portfolio
        await Trade.create({
            type: 'BUY',
            portfolioId,
            shareSymbol,
            price: symbolExists.price,
            sharesBought: 1,
            sharesSold: 0,
            tradeDate: new Date(),
        });

        // Return a success response
        res.status(200).json({ message: 'Buy operation successful' });
    } catch (error) {
        logger.error(error);
        // Return an error response
        res.status(500).json({ message: 'An error occurred during the buy operation' });
    }
});

/**
 * @swagger
 * /api/shares/{symbol}/quantity:
 *   get:
 *     summary: Get total shares bought and sold for a share in a specific portfolio
 *     tags:
 *       - Single Symbol Quantity
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 availableQuantity:
 *                   type: integer
 *       500:
 *         description: An error occurred while retrieving the share quantity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/shares/:symbol/quantity', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { portfolioId } = req.query;

        // Check if the symbol exists in the trades
        const symbolExists = await Trade.findOne({
            where: { shareSymbol: symbol },
        });

        if (!symbolExists) {
            return res.status(400).json({ message: 'Invalid symbol' });
        }

        // Get the total shares bought in the specific portfolio
        const totalSharesBought = await Trade.sum('sharesBought', {
            where: { shareSymbol: symbol, portfolioId },
        });

        // Get the total shares sold in the specific portfolio
        const totalSharesSold = await Trade.sum('sharesSold', {
            where: { shareSymbol: symbol, portfolioId },
        });

        // Calculate the available quantity for selling
        const availableQuantity = Math.max(totalSharesBought - totalSharesSold, 0);

        res.status(200).json({ availableQuantity });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving the share quantity' });
    }
});

/**
 * @swagger
 * /api/shares/group:
 *   get:
 *     summary: Group shares count by symbol
 *     tags:
 *       - All Symbol Quantity Group By
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shareCounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       shareSymbol:
 *                         type: string
 *                       count:
 *                         type: integer
 *       500:
 *         description: An error occurred while retrieving the share counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/shares/group', async (req, res) => {
    try {
        const shareCounts = await Trade.findAll({
            attributes: [
                'shareSymbol',
                [sequelize.literal('SUM("sharesBought" - "sharesSold")'), 'count'],
            ],
            group: 'shareSymbol',
        });

        res.status(200).json({ shareCounts });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving the share counts' });
    }

});



module.exports = router;

const express = require('express');
const sqlite3 = require('sqlite3');

const seriesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Get all series
seriesRouter.get('/', (req, res) => {
    db.all("SELECT * FROM Series", (error, rows) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({series: rows});
        }
    });
});

module.exports = seriesRouter;
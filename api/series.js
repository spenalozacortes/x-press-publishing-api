const express = require('express');
const sqlite3 = require('sqlite3');

const seriesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Search series in the database, if it exists attach it to req object along with its ID
seriesRouter.param('seriesId', (req, res, next, id) => {
    db.get("SELECT * FROM Series WHERE id = $id", {$id: id}, (error, row) => {
        if (error) {
            next(error);
        } else if (row) {
            req.series = row;
            req.id = id;
            next();
        } else {
            res.status(404).send();
        }
    });
});

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

// Get a series
seriesRouter.get('/:seriesId', (req, res) => {
    res.status(200).json({series: req.series});
});

module.exports = seriesRouter;
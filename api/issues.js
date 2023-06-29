const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = express.Router({mergeParams: true});

// Get all issues of the specified series
issuesRouter.get('/', (req, res) => {
    db.all("SELECT * FROM Issue WHERE series_id = $seriesId", {$seriesId: req.seriesId}, (error, rows) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({issues: rows});
        }
    });
});

module.exports = issuesRouter;
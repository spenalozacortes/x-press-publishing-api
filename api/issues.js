const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = express.Router({mergeParams: true});

// Check for valid inputs
const validateData = (req, res, next) => {
    const { name, issueNumber, publicationDate, artistId, seriesId } = req.body.issue;
    if (name && issueNumber && publicationDate && artistId && seriesId) {
        db.get("SELECT * FROM Artist WHERE id = $id", {$id: artistId}, (error, row) => {
            if (error) {
                next(error);
            } else if (row) {
                next();
            } else {
                res.status(400).send();
            }
        });
    } else {
        res.status(400).send();
    }
}

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

// Create issue
issuesRouter.post('/', validateData, (req, res) => {
    const { name, issueNumber, publicationDate, artistId, seriesId } = req.body.issue;
    db.run("INSERT INTO Issue(name, issue_number, publication_date, artist_id, series_id) VALUES($name, $issueNumber, $publicationDate, $artistId, $seriesId)", {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId,
        $seriesId: seriesId
    }, function(error) {
        if (error) {
            next(error);
        } else {
            db.get("SELECT * FROM Issue WHERE id = $id", {$id: this.lastID}, (error, row) => {
                if (error) {
                    next(error);
                } else {
                    res.status(201).json({issue: row});
                }
            });
        }
    });
});

module.exports = issuesRouter;
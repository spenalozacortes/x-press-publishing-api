const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = express.Router({mergeParams: true});

// Check if issue with provided ID exists and attach ID to req object
issuesRouter.param('issueId', (req, res, next, issueId) => {
    db.get("SELECT * FROM Issue WHERE id = $id", {$id: issueId}, (error, row) => {
        if (row) {
            req.issueId = issueId;
            next();
        } else {
            res.status(404).send();
        }
    });
});

// Check for valid inputs
const validateData = (req, res, next) => {
    const { name, issueNumber, publicationDate, artistId } = req.body.issue;
    if (name && issueNumber && publicationDate && artistId ) {
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
issuesRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Issue WHERE series_id = $seriesId", {$seriesId: req.seriesId}, (error, rows) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({issues: rows});
        }
    });
});

// Create issue
issuesRouter.post('/', validateData, (req, res, next) => {
    const { name, issueNumber, publicationDate, artistId } = req.body.issue;
    db.run("INSERT INTO Issue(name, issue_number, publication_date, artist_id, series_id) VALUES($name, $issueNumber, $publicationDate, $artistId, $seriesId)", {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId,
        $seriesId: req.seriesId
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

// Update issue
issuesRouter.put('/:issueId', validateData, (req, res, next) => {
    const { name, issueNumber, publicationDate, artistId } = req.body.issue;
    db.run("UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId, series_id = $seriesId WHERE id = $id", {
        $id: req.issueId,
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId,
        $seriesId: req.seriesId
    }, (error) => {
        if (error) {
            next(error);
        } else {
            db.get("SELECT * FROM Issue WHERE id = $id", {$id: req.issueId}, (error, row) => {
                if (error) {
                    next(error);
                } else {
                    res.status(200).json({issue: row});
                }
            });
        }
    });
});

// Delete issue
issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run("DELETE FROM Issue WHERE id = $id", {$id: req.issueId}, (error) => {
        if (error) {
            next(error);
        } else {
            res.status(204).send();
        }
    });
});

module.exports = issuesRouter;
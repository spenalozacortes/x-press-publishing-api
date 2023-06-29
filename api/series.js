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

// Check for valid inputs
const validateData = (req, res, next) => {
    const { name, description } = req.body.series;
    if (name && description) {
        next();
    } else {
        res.status(400).send();
    }
};

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

// Get series
seriesRouter.get('/:seriesId', (req, res) => {
    res.status(200).json({series: req.series});
});

// Create series
seriesRouter.post('/', validateData, (req, res) => {
    const { name, description } = req.body.series;
    db.run("INSERT INTO Series (name, description) VALUES ($name, $description)", {
        $name: name,
        $description: description
    }, function(error) {
        if (error) {
            next(error);
        } else {
            db.get("SELECT * FROM Series WHERE id = $id", {$id: this.lastID}, (error, row) => {
                if (error) {
                    next(error);
                } else {
                    res.status(201).json({series: row});
                }
            });
        }
    });
});

// Update series
seriesRouter.put('/:seriesId', validateData, (req, res) => {
    const { name, description } = req.body.series;
    db.run("UPDATE Series SET name = $name, description = $description WHERE id = $id", {
        $id: req.id,
        $name: name,
        $description: description
    }, (error) => {
        if (error) {
            next(error);
        } else {
            db.get("SELECT * FROM Series WHERE id = $id", {$id: req.id}, (error, row) => {
                if (error) {
                    next(error);
                } else {
                    res.status(200).json({series: row});
                }
            });
        }
    });
});

module.exports = seriesRouter;
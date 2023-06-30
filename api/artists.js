const express = require('express');
const sqlite3 = require('sqlite3');

const artistsRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Search an artist in the database and attach it to the request object along with its ID
artistsRouter.param('artistId', (req, res, next, id) => {
    db.get("SELECT * FROM Artist WHERE id = $artistId", {$artistId: id}, (error, row) => {
        if (error) {
            next(error);
        } else if (row) {
            req.artist = row;
            req.id = id;
            next();
        } else {
            res.status(404).send();
        }
    });
});

// Get all artists
artistsRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (error, rows) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({artists: rows});
        }
    });
});

// Get an artist by ID
artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist: req.artist});
});

// Create an artist
artistsRouter.post('/', (req, res, next) => {
    const { name, dateOfBirth, biography } = req.body.artist;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    if (name && dateOfBirth && biography) {
        db.run("INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)", {
            $name: name,
            $dateOfBirth: dateOfBirth,
            $biography: biography,
            $isCurrentlyEmployed: isCurrentlyEmployed
        }, function(error) {
            if (error) {
                next(error);
            } else {
                db.get("SELECT * FROM Artist WHERE id = $id", {$id: this.lastID}, (error, row) => {
                    res.status(201).json({artist: row});
                });
            }
        });
    } else {
        res.status(400).send();
    }
});

// Update an artist
artistsRouter.put('/:artistId', (req, res, next) => {
    const { name, dateOfBirth, biography, isCurrentlyEmployed } = req.body.artist;

    if (name && dateOfBirth && biography && isCurrentlyEmployed) {
        db.run("UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $id", {
            $id: req.id,
            $name: name,
            $dateOfBirth: dateOfBirth,
            $biography: biography,
            $isCurrentlyEmployed: isCurrentlyEmployed
        }, (error) => {
            if (error) {
                next(error);
            } else {
                db.get("SELECT * FROM Artist WHERE id = $id", {$id: req.id}, (error, row) => {
                    res.status(200).json({artist: row});
                });
            }
        });
    } else {
        res.status(400).send();
    }
});

// "Delete" an artist (set to unemployed)
artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run("UPDATE Artist SET is_currently_employed = 0 WHERE id = $id", {$id: req.id}, (error) => {
        if (error) {
            next(error);
        } else {
            db.get("SELECT * FROM Artist WHERE id = $id", {$id: req.id}, (error, row) => {
                res.status(200).json({artist: row});
            });
        }
    });
});

module.exports = artistsRouter;
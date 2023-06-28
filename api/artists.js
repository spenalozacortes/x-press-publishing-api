const express = require('express');
const sqlite3 = require('sqlite3');

const artistsRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get("SELECT * FROM Artist WHERE id = $artistId", {$artistId: artistId}, (error, row) => {
        if (error) {
            next(error);
        } else if (row) {
            req.artist = row;
            next();
        } else {
            res.status(404).send();
        }
    });
});

artistsRouter.get('/', (req, res) => {
    db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (error, rows) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({artists: rows});
        }
    });
});

module.exports = artistsRouter;
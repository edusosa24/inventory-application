var Genre = require('../models/genre');
var Game = require('../models/game');
const { body, validationResult } = require('express-validator');
var async = require('async');


// Display list of all Genres.
exports.genre_list = function (req, res, next) {
    Genre.find({})
        .sort({ title: 1 })
        .exec(function (err, list_genres) {
            if (err) { return next(err); }

            res.render('genres_list', { title: 'All Genres', genres_list: list_genres });
        });
};


// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {

    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },

        genre_games: function (callback) {
            Game.find({ 'genre': req.params.id })
                .populate('developer publisher')
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.genre === null) {
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }

        res.render('genre_details', { genre: results.genre, genre_games: results.genre_games });
    });

};


// Handle Genre create on GET.
exports.genre_create_get = function (req, res, next) {
    res.render('genre_form', { title: 'New Genre' });
};


// Handle Genre create on POST.
exports.genre_create_post = [
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var genre = new Genre(
            { name: req.body.name }
        );
        if (!errors.isEmpty()) {
            res.render('genre_form', { title: 'New Genre', genre: genre, errors: errors.array() });
            return;
        }
        else {
            Genre.findOne({ 'name': req.body.name })
                .exec(function (err, found_genre) {
                    if (err) { return next(err); }
                    if (found_genre) {
                        res.redirect(found_genre.url);
                    }
                    else {
                        genre.save(function (err) {
                            if (err) { return next(err); }
                            res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {

    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback)
        },
        genre_games: function (callback) {
            Game.find({ 'genre': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.genre == null) {
            res.redirect('/catalog/genres');
        }

        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_games: results.genre_games });
    });

};


// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.body.genreid).exec(callback)
        },
        genre_games: function (callback) {
            Game.find({ 'genre': req.body.genreid }).exec(callback)
        },
    }, function (err, results) {

        if (err) { return next(err); }
        if (results.genre_games.length > 0) {
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_games: results.genre_games });
            return;
        }
        else {
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {

                if (err) { return next(err); }
                res.redirect('/catalog/genres');
            })
        }
    });
};


// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {

    Genre.findById(req.params.id, function (err, genre) {
        if (err) { return next(err); }
        if (genre == null) {
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_form', { title: 'Update Genre', genre: genre });
    });
};


// Handle Genre update on POST.
exports.genre_update_post = [

    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        var genre = new Genre(
            {
                name: req.body.name,
                _id: req.params.id
            });

        if (!errors.isEmpty()) {
            res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors.array() });
            return;
        }
        else {
            Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, genre) {
                if (err) { return next(err); }
                res.redirect(genre.url);
            });
        }
    }
];




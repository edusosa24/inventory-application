var Game = require('../models/game');
var Developer = require('../models/developer');
var Publisher = require('../models/publisher');
var Platform = require('../models/platform');
var Genre = require('../models/genre');
const { body, validationResult } = require('express-validator');
var async = require('async');
const { populate } = require('../models/game');
const game = require('../models/game');

// Display Catalog index.
exports.index = function (req, res) {
    async.parallel({
        game_count: function (callback) {
            Game.countDocuments({}, callback);
        },
        developer_count: function (callback) {
            Developer.countDocuments({}, callback);
        },
        publisher_count: function (callback) {
            Publisher.countDocuments({}, callback);
        },
        platform_count: function (callback) {
            Platform.countDocuments({}, callback);
        },
        genre_count: function (callback) {
            Genre.countDocuments({}, callback);
        }
    }, function (err, results) {
        res.render('index', { title: 'Game Library Home', error: err, data: results });
    });
};

// Display list of all Games.
exports.game_list = function (req, res, next) {
    Game.find({}, 'title developer publisher image_url')
        .sort({ title: 1 })
        .populate('developer publisher')
        .exec(function (err, list_games) {
            if (err) { return next(err); }

            res.render('game_list', { title: 'All Games', game_list: list_games });
        });
};

// Display detail page for a specific Game.
exports.game_detail = function (req, res, next) {
    Game.findById(req.params.id)
        .populate('developer publisher platform genre')
        .exec(function (err, game) {
            if (err) { return next(err); }
            if (game === null) {
                var err = new Error('Game not found');
                err.status = 404;
                return next(err);
            }

            res.render('game_details', { game: game });
        });

};



// Display Game create form on GET.
exports.game_create_get = function (req, res, next) {

    async.parallel({
        developers: function (callback) {
            Developer.find(callback);
        },
        publishers: function (callback) {
            Publisher.find(callback);
        },
        platforms: function (callback) {
            Platform.find(callback);
        },
        genres: function (callback) {
            Genre.find(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        res.render('game_form', { title: 'New Game', developers: results.developers, publishers: results.publishers, platforms: results.platforms, genres: results.genres });
    });
};

// Handle Game create on POST.
exports.game_create_post = [
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }

        if (!(req.body.platform instanceof Array)) {
            if (typeof req.body.platform === 'undefined')
                req.body.platform = [];
            else
                req.body.platform = new Array(req.body.platform);
        }

        next();
    },

    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('launch_date', 'Release date must be specified').isISO8601().toDate(),
    body('developer', 'Developer must be specified').trim().isLength({ min: 1 }).escape(),
    body('publisher', 'Publisher must be specified').trim().isLength({ min: 1 }).escape(),
    body('platform.*').isLength({ min: 1 }).escape(),
    body('summary', 'Game summary must be specified').trim().isLength({ min: 1 }).escape(),
    body('genre.*').isLength({ min: 1 }).escape(),
    body('image_url').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        var game = new Game(
            {
                title: req.body.name,
                launch_date: req.body.launch_date,
                developer: req.body.developer,
                publisher: req.body.publisher,
                platform: req.body.platform,
                summary: req.body.summary,
                genre: req.body.genre,
                image_url: req.body.image_url
            });

        if (!errors.isEmpty()) {
            async.parallel({
                developers: function (callback) {
                    Developer.find(callback);
                },
                publishers: function (callback) {
                    Publisher.find(callback);
                },
                platforms: function (callback) {
                    Platform.find(callback);
                },
                genres: function (callback) {
                    Genre.find(callback);
                }, function(err, results) {
                    if (err) { return next(err); }

                    for (let i = 0; i < results.genres.length; i++) {
                        if (game.genre.indexOf(results.genres[i]._id) > -1) {
                            results.genres[i].checked = 'true';
                        }
                    }
                    for (let i = 0; i < results.platforms.length; i++) {
                        if (game.platform.indexOf(results.platforms[i]._id) > -1) {
                            results.platforms[i].checked = 'true';
                        }
                    }
                    res.render('game_form', { title: 'New Game', developers: results.developers, publishers: results.publishers, platforms: results.platforms, genres: results.genres, game: game, errors: errors.array() });
                    return;
                }
            });
        }
        else {
            Game.findOne({ 'title': req.body.name })
                .exec(function (err, found_game) {
                    if (err) { return next(err); }
                    if (found_game) {
                        res.redirect(found_game.url);
                    }
                    else {
                        game.save(function (err) {
                            if (err) { return next(err); }
                            res.redirect(game.url);
                        });
                    }
                });
        }
    }
];



// Display Game delete form on GET.
exports.game_delete_get = function (req, res, next) {

    Game.findById(req.params.id)
        .exec(function (err, game) {
            if (err) { return next(err); }
            if (game == null) {
                res.redirect('/catalog/games');
            }
            res.render('game_delete', { title: 'Delete Game', game: game });
        })

};

// Handle Game delete on POST.
exports.game_delete_post = function (req, res, next) {

    Game.findByIdAndRemove(req.body.gameid, function deleteGame(err) {
        if (err) { return next(err); }
        res.redirect('/catalog/games');
    });

};


// Display Game update form on GET.
exports.game_update_get = function (req, res, next) {

    async.parallel({
        game: function (callback) {
            Game.findById(req.params.id).populate('developer platform genre publisher').exec(callback);
        },
        developers: function (callback) {
            Developer.find(callback);
        },
        publishers: function (callback) {
            Publisher.find(callback);
        },
        platforms: function (callback) {
            Platform.find(callback);
        },
        genres: function (callback) {
            Genre.find(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.game == null) {
            var err = new Error('Game not found');
            err.status = 404;
            return next(err);
        }
        for (var i = 0; i < results.genres.length; i++) {
            for (var j = 0; j < results.game.genre.length; j++) {
                if (results.genres[i]._id.toString() === results.game.genre[j]._id.toString()) {
                    results.genres[i].checked = 'true';
                }
            }
        }
        for (var i = 0; i < results.platforms.length; i++) {
            for (var j = 0; j < results.game.platform.length; j++) {
                if (results.platforms[i]._id.toString() === results.game.platform[j]._id.toString()) {
                    results.platforms[i].checked = 'true';
                }
            }
        }
        res.render('game_form', { title: 'Update Game', developers: results.developers, publishers: results.publishers, platforms: results.platforms, genres: results.genres, game: results.game });
    });

};


// Handle Game update on POST.
exports.game_update_post = [

    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }

        if (!(req.body.platform instanceof Array)) {
            if (typeof req.body.platform === 'undefined')
                req.body.platform = [];
            else
                req.body.platform = new Array(req.body.platform);
        }

        next();
    },

    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('launch_date', 'Release date must be specified').isISO8601().toDate(),
    body('developer', 'Developer must be specified').trim().isLength({ min: 1 }).escape(),
    body('publisher', 'Publisher must be specified').trim().isLength({ min: 1 }).escape(),
    body('platform.*').isLength({ min: 1 }).escape(),
    body('summary', 'Game summary must be specified').trim().isLength({ min: 1 }).escape(),
    body('genre.*').isLength({ min: 1 }).escape(),
    body('image_url').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        var game = new Game(
            {
                title: req.body.name,
                launch_date: req.body.launch_date,
                developer: req.body.developer,
                publisher: req.body.publisher,
                platform: req.body.platform,
                summary: req.body.summary,
                genre: req.body.genre,
                image_url: req.body.image_url,
                _id: req.params.id
            });

        if (!errors.isEmpty()) {
            async.parallel({
                game: function (callback) {
                    Game.findById(req.params.id).populate('developer platform genre publisher').exec(callback);
                },
                developers: function (callback) {
                    Developer.find(callback);
                },
                publishers: function (callback) {
                    Publisher.find(callback);
                },
                platforms: function (callback) {
                    Platform.find(callback);
                },
                genres: function (callback) {
                    Genre.find(callback);
                },

            },
                function (err, results) {
                    if (err) { return next(err); }

                    for (let i = 0; i < results.genres.length; i++) {
                        if (game.genre.indexOf(results.genres[i]._id) > -1) {
                            results.genres[i].checked = 'true';
                        }
                    }
                    for (let i = 0; i < results.platforms.length; i++) {
                        if (game.platform.indexOf(results.platforms[i]._id) > -1) {
                            results.platforms[i].checked = 'true';
                        }
                    }
                },

                function (err, results) {
                    if (err) { return next(err); }
                    if (results.game == null) {
                        var err = new Error('Game not found');
                        err.status = 404;
                        return next(err);
                    }
                    res.render('game_form', { title: 'Update Game', developers: results.developers, publishers: results.publishers, platforms: results.platforms, genres: results.genres, game: results.game, errors: errors.array() });
                    return;
                });
        }
        else {
            Game.findByIdAndUpdate(req.params.id, game, {}, function (err, game) {
                if (err) { return next(err); }
                res.redirect(game.url);
            });
        }
    }
];

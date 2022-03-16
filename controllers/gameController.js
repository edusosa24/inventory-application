var Game = require('../models/game');
var Developer = require('../models/developer');
var Publisher = require('../models/publisher');
var Platform = require('../models/platform');
var Genre = require('../models/genre');
var async = require('async');

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
            if (err) { return next(err); } // Error in API usage.
            if (game === null) { // No results.
                var err = new Error('Game not found');
                err.status = 404;
                return next(err);
            }

            res.render('game_details', { game: game });
        });

};

// Display Game create form on GET.
exports.game_create_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Game create GET');
};

// Handle Game create on POST.
exports.game_create_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Game create POST');
};

// Display Game delete form on GET.
exports.game_delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Game delete GET');
};

// Handle Game delete on POST.
exports.game_delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Game delete POST');
};

// Display Game update form on GET.
exports.game_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Game update GET');
};

// Handle Game update on POST.
exports.game_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Game update POST');
};
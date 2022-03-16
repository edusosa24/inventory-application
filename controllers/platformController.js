var Platform = require('../models/platform');
var Game = require('../models/game');
var async = require('async');

// Display list of all Platforms.
exports.platform_list = function (req, res, next) {
    Platform.find({}, 'name')
        .sort({ title: 1 })
        .exec(function (err, list_platforms) {
            if (err) { return next(err); }

            res.render('platforms_list', { title: 'All Platforms', platforms_list: list_platforms });
        });
};

// Display detail page for a specific Platform.
exports.platform_detail = function (req, res, next) {

    async.parallel({
        platform: function (callback) {
            Platform.findById(req.params.id)
                .exec(callback);
        },

        platform_games: function (callback) {
            Game.find({ 'platform': req.params.id })
                .populate('developer publisher')
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.platform === null) {
            var err = new Error('Platform not found');
            err.status = 404;
            return next(err);
        }

        res.render('platform_details', { platform: results.platform, platform_games: results.platform_games });
    });

};

// Display Platform create form on GET.
exports.platform_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Platform create GET');
};

// Handle Platform create on POST.
exports.platform_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Platform create POST');
};

// Display Platform delete form on GET.
exports.platform_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Platform delete GET');
};

// Handle Platform delete on POST.
exports.platform_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Platform delete POST');
};

// Display Platform update form on GET.
exports.platform_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Platform update GET');
};

// Handle Platform update on POST.
exports.platform_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Platform update POST');
};
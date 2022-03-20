var Platform = require('../models/platform');
var Game = require('../models/game');
const { body, validationResult } = require('express-validator');
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


// Handle Platform create on GET.
exports.platform_create_get = function (req, res, next) {
    res.render('platform_form', { title: 'New Platform' });
};


// Handle Platform create on POST.
exports.platform_create_post = [
    body('name', 'Platform name required').trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var platform = new Platform(
            { name: req.body.name }
        );
        if (!errors.isEmpty()) {
            res.render('platform_form', { title: 'New Platform', platform: platform, errors: errors.array() });
            return;
        }
        else {
            Platform.findOne({ 'name': req.body.name })
                .exec(function (err, found_platform) {
                    if (err) { return next(err); }
                    if (found_platform) {
                        res.redirect(found_platform.url);
                    }
                    else {
                        platform.save(function (err) {
                            if (err) { return next(err); }
                            res.redirect(platform.url);
                        });
                    }
                });
        }
    }
];


// Display Platform delete form on GET.
exports.platform_delete_get = function (req, res, next) {

    async.parallel({
        platform: function (callback) {
            Platform.findById(req.params.id).exec(callback)
        },
        platform_games: function (callback) {
            Game.find({ 'platform': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.platform == null) {
            res.redirect('/catalog/platforms');
        }

        res.render('platform_delete', { title: 'Delete Platform', platform: results.platform, platform_games: results.platform_games });
    });

};


// Handle Platform delete on POST.
exports.platform_delete_post = function (req, res, next) {
    async.parallel({
        platform: function (callback) {
            Platform.findById(req.body.platformid).exec(callback)
        },
        platform_games: function (callback) {
            Game.find({ 'platform': req.body.platformid }).exec(callback)
        },
    }, function (err, results) {

        if (err) { return next(err); }
        if (results.platform_games.length > 0) {
            res.render('platform_delete', { title: 'Delete Platform', platform: results.platform, platform_games: results.platform_games });
            return;
        }
        else {
            Platform.findByIdAndRemove(req.body.platformid, function deletePlatform(err) {

                if (err) { return next(err); }
                res.redirect('/catalog/platforms');
            })
        }
    });
};


// Display Platform update form on GET.
exports.platform_update_get = function (req, res, next) {

    Platform.findById(req.params.id, function (err, platform) {
        if (err) { return next(err); }
        if (platform == null) {
            var err = new Error('Platform not found');
            err.status = 404;
            return next(err);
        }
        res.render('platform_form', { title: 'Update Platform', platform: platform });
    });
};


// Handle Platform update on POST.
exports.platform_update_post = [

    body('name', 'Platform name required').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        var platform = new Platform(
            {
                name: req.body.name,
                _id: req.params.id
            });

        if (!errors.isEmpty()) {
            res.render('platform_form', { title: 'Update Platform', platform: platform, errors: errors.array() });
            return;
        }
        else {
            Platform.findByIdAndUpdate(req.params.id, platform, {}, function (err, platform) {
                if (err) { return next(err); }
                res.redirect(platform.url);
            });
        }
    }
];







var Developer = require('../models/developer');
var Game = require('../models/game');
var async = require('async');

// Display list of all Developers.
exports.developer_list = function (req, res, next) {
    Developer.find({}, 'name foundation_year')
        .sort({ title: 1 })
        .exec(function (err, list_developers) {
            if (err) { return next(err); }

            res.render('developers_list', { title: 'All Developers', developers_list: list_developers });
        });
};

// Display detail page for a specific Developer.
exports.developer_detail = function (req, res, next) {

    async.parallel({
        developer: function (callback) {
            Developer.findById(req.params.id)
                .exec(callback)
        },
        developer_games: function (callback) {
            Game.find({ 'developer': req.params.id })
                .populate('publisher')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.developer === null) { // No results.
            var err = new Error('Developer not found');
            err.status = 404;
            return next(err);
        }

        res.render('developer_details', { developer: results.developer, developer_games: results.developer_games });
    });

};

// Display Developer create form on GET.
exports.developer_create_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Developer create GET');
};

// Handle Developer create on POST.
exports.developer_create_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Developer create POST');
};

// Display Developer delete form on GET.
exports.developer_delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Developer delete GET');
};

// Handle Developer delete on POST.
exports.developer_delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Developer delete POST');
};

// Display Developer update form on GET.
exports.developer_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Developer update GET');
};

// Handle Developer update on POST.
exports.developer_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Developer update POST');
};
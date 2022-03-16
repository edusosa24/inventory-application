var Publisher = require('../models/publisher');
var Game = require('../models/game');
var async = require('async');

// Display list of all Publishers.
exports.publisher_list = function (req, res, next) {
    Publisher.find({}, 'name foundation_year')
        .sort({ title: 1 })
        .exec(function (err, list_publishers) {
            if (err) { return next(err); }

            res.render('publishers_list', { title: 'All Publishers', publishers_list: list_publishers });
        });
};

// Display detail page for a specific Publisher.
exports.publisher_detail = function (req, res, next) {

    async.parallel({
        publisher: function (callback) {
            Publisher.findById(req.params.id)
                .exec(callback)
        },
        publisher_games: function (callback) {
            Game.find({ 'publisher': req.params.id })
                .populate('developer')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.publisher === null) {
            var err = new Error('Publisher not found');
            err.status = 404;
            return next(err);
        }

        res.render('publisher_details', { publisher: results.publisher, publisher_games: results.publisher_games });
    });

};

// Display Publisher create form on GET.
exports.publisher_create_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Publisher create GET');
};

// Handle Publisher create on POST.
exports.publisher_create_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Publisher create POST');
};

// Display Publisher delete form on GET.
exports.publisher_delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Publisher delete GET');
};

// Handle Publisher delete on POST.
exports.publisher_delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Publisher delete POST');
};

// Display Publisher update form on GET.
exports.publisher_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Publisher update GET');
};

// Handle Publisher update on POST.
exports.publisher_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Publisher update POST');
};
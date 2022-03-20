var Publisher = require('../models/publisher');
var Game = require('../models/game');
const { body, validationResult } = require('express-validator');
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
exports.publisher_create_get = function (req, res, next) {
    res.render('publisher_form', { title: 'New Publisher' });
};

// Handle Publisher create on POST.
exports.publisher_create_post = [
    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('foundation_year').isLength({ min: 1 }).withMessage("Foundation year must be specified").isInt({ min: 1850 }).withMessage("Minium year 1850").escape(),
    body('origin_country', 'Origin country must be specified').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);


        var publisher = new Publisher(
            {
                name: req.body.name,
                foundation_year: req.body.foundation_year,
                origin_country: req.body.origin_country
            });

        if (!errors.isEmpty) {
            res.render('publisher_form', { title: 'New Publisher', publisher: req.body, errors: errors.array() });
            return;
        }

        else {
            Publisher.findOne({ 'name': req.body.name })
                .exec(function (err, found_publisher) {
                    if (err) { return next(err); }
                    if (found_publisher) {
                        res.redirect(found_publisher.url);
                    }
                    else {
                        publisher.save(function (err) {
                            if (err) { return next(err); }
                            res.redirect(publisher.url);
                        });
                    }
                });
        }
    }
];

// Display Publisher delete form on GET.
exports.publisher_delete_get = function (req, res, next) {

    async.parallel({
        publisher: function (callback) {
            Publisher.findById(req.params.id).exec(callback)
        },
        publisher_games: function (callback) {
            Game.find({ 'publisher': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.publisher == null) {
            res.redirect('/catalog/publishers');
        }

        res.render('publisher_delete', { title: 'Delete Publisher', publisher: results.publisher, publisher_games: results.publisher_games });
    });

};


// Handle Publisher delete on POST.
exports.publisher_delete_post = function (req, res, next) {
    async.parallel({
        publisher: function (callback) {
            Publisher.findById(req.body.publisherid).exec(callback)
        },
        publisher_games: function (callback) {
            Game.find({ 'publisher': req.body.publisherid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.publisher_games.length > 0) {
            res.render('publisher_delete', { title: 'Delete Publisher', publisher: results.publisher, publisher_games: results.publisher_games });
            return;
        }
        else {
            Publisher.findByIdAndRemove(req.body.publisherid, function deletePublisher(err) {
                if (err) { return next(err); }
                res.redirect('/catalog/publishers')
            })
        }
    });
};


// Display Publisher update form on GET.
exports.publisher_update_get = function (req, res, next) {

    Publisher.findById(req.params.id, function (err, publisher) {
        if (err) { return next(err); }
        if (publisher == null) {
            var err = new Error('Publisher not found');
            err.status = 404;
            return next(err);
        }
        res.render('publisher_form', { title: 'Update Publisher', publisher: publisher });
    });
};


// Handle Publisher update on POST.
exports.publisher_update_post = [

    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('foundation_year').isLength({ min: 1 }).withMessage("Foundation year must be specified").isInt({ min: 1850 }).withMessage("Minium year 1850").escape(),
    body('origin_country', 'Origin country must be specified').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        var publisher = new Publisher(
            {
                name: req.body.name,
                foundation_year: req.body.foundation_year,
                origin_country: req.body.origin_country,
                _id: req.params.id
            });

        if (!errors.isEmpty()) {
            res.render('publisher_form', { title: 'Update Publisher', publisher: publisher, errors: errors.array() });
            return;
        }
        else {
            Publisher.findByIdAndUpdate(req.params.id, publisher, {}, function (err, publisher) {
                if (err) { return next(err); }
                res.redirect(publisher.url);
            });
        }
    }
];
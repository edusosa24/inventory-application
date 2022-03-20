var Developer = require('../models/developer');
var Game = require('../models/game');
const { body, validationResult } = require('express-validator');
var async = require('async');
const { concatLimit } = require('async');


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
        if (err) { return next(err); }
        if (results.developer === null) {
            var err = new Error('Developer not found');
            err.status = 404;
            return next(err);
        }

        res.render('developer_details', { developer: results.developer, developer_games: results.developer_games });
    });

};


// Display Developer create form on GET.
exports.developer_create_get = function (req, res, next) {
    res.render('developer_form', { title: 'New Developer' });
};


// Handle Developer create on POST.
exports.developer_create_post = [

    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('foundation_year').isLength({ min: 1 }).withMessage("Foundation year must be specified").isInt({ min: 1850 }).withMessage("Minium year 1850").escape(),
    body('origin_country', 'Origin country must be specified').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        var developer = new Developer(
            {
                name: req.body.name,
                foundation_year: req.body.foundation_year,
                origin_country: req.body.origin_country
            });

        if (!errors.isEmpty()) {
            res.render('developer_form', { title: 'New Developer', developer: req.body, errors: errors.array() });
            return;
        }

        else {
            Developer.findOne({ 'name': req.body.name })
                .exec(function (err, found_developer) {
                    if (err) { return next(err); }
                    if (found_developer) {
                        res.redirect(found_developer.url);
                    }
                    else {

                        developer.save(function (err) {
                            if (err) { return next(err); }
                            res.redirect(developer.url);
                        });
                    }
                });
        }
    }
];


// Display Developer delete form on GET.
exports.developer_delete_get = function (req, res, next) {

    async.parallel({
        developer: function (callback) {
            Developer.findById(req.params.id).exec(callback)
        },
        developer_games: function (callback) {
            Game.find({ 'developer': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.developer == null) {
            res.redirect('/catalog/developers');
        }

        res.render('developer_delete', { title: 'Delete Developer', developer: results.developer, developer_games: results.developer_games });
    });

};


// Handle Developer delete on POST.
exports.developer_delete_post = function (req, res, next) {
    async.parallel({
        developer: function (callback) {
            Developer.findById(req.body.developerid).exec(callback)
        },
        developer_games: function (callback) {
            Game.find({ 'developer': req.body.developerid }).exec(callback)
        },
    }, function (err, results) {

        if (err) { return next(err); }
        if (results.developer_games.length > 0) {
            res.render('developer_delete', { title: 'Delete Developer', developer: results.developer, developer_games: results.developer_games });
            return;
        }
        else {
            Developer.findByIdAndRemove(req.body.developerid, function deleteDeveloper(err) {

                if (err) { return next(err); }
                res.redirect('/catalog/developers');
            })
        }
    });
};



// Display Developer update form on GET.
exports.developer_update_get = function (req, res, next) {

    Developer.findById(req.params.id, function (err, developer) {
        if (err) { return next(err); }
        if (developer == null) {
            var err = new Error('Developer not found');
            err.status = 404;
            return next(err);
        }
        res.render('developer_form', { title: 'Update Developer', developer: developer });
    });
};


// Handle Developer update on POST.
exports.developer_update_post = [

    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('foundation_year').isLength({ min: 1 }).withMessage("Foundation year must be specified").isInt({ min: 1850 }).withMessage("Minium year 1850").escape(),
    body('origin_country', 'Origin country must be specified').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        var developer = new Developer(
            {
                name: req.body.name,
                foundation_year: req.body.foundation_year,
                origin_country: req.body.origin_country,
                _id: req.params.id
            });

        if (!errors.isEmpty()) {
            res.render('developer_form', { title: 'Update Developer', developer: developer, errors: errors.array() });
            return;
        }
        else {
            Developer.findByIdAndUpdate(req.params.id, developer, {}, function (err, developer) {
                if (err) { return next(err); }
                res.redirect(developer.url);
            });
        }
    }
];
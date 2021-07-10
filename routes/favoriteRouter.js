const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('campsites')
    .populate('user')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            req.body.forEach(fav => {
                if (!favorite.campsites.includes(fav._id)) {
                    favorite.campsites.push(fav._id);
                }
            });
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            Favorite.create({ user: req.user._id })
            .then(favorite => {
                req.body.forEach(fav => {
                    if (!favorite.campsites.includes(fav._id)) {
                        favorite.campsites.push(fav._id);
                    }
                });
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
        }
    }).catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(favorite => {
        if(favorite){
            res.statusCode = 200;
            res.setHeader('Conent-type', 'application/json')
            res.json(favorite);
        } else{
            res.end('You do not have any favorites to delete.')
        }
    })
    .catch(err => next(err));
});




favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:favoriteId');
})
.post(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
            .then(favorites => {
                if (favorites) {
                    if (!favorites.campsites.includes(req.params.campsiteId)) {
                        favorites.campsites.push(req.params.campsiteId)
                        favorites.save()
                    } else {
                        res.end('That campsite is already in the list of favorites!')
                    }
                } else {
                    Favorite.create({ user: req.user._id })
                        .then(favorites => {
                            favorites.campsites.push(req.params.campsiteId)
                            favorites.save()
                                .then(fav => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(fav);
                                })
                                .catch(err => next(err))
                        })
                        .catch(err => next(err))
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err))
    })
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:FavoriteId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite){
            // const index = favorite.campsites.indexOf(req.params.campsiteId);
            favorite.campsites = favorite.campsites.filter(fav => fav.toString() !== req.params.campsiteId.toString());
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Conent-type', 'application/json')
                res.json(favorite);
            })
            .catch(err => next(err))
        } else{
            res.setHeader('Content-Type', 'text/plain')
            res.statusCod = 200;
            res.end('You do not have any favorites to delete');
        }
    })
    .catch(err => next(err));
});



module.exports = favoriteRouter;
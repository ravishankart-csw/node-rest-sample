const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Register New user
router.post('/signup', (req, res) => {
    if (req.body.email && req.body.password !== '') {
        User.find({email: req.body.email})
            .exec()
            .then(user => {
                if (user.length >= 1) {
                    return res.status(409).json({message: 'Mail already exists'});
                } else {
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({
                                error: err
                            });
                        } else {
                            const user = new User({
                                _id: new mongoose.Types.ObjectId(),
                                email: req.body.email,
                                password: hash
                            });
                            user.save().then(result => {
                                res.status(201).json({
                                    message: 'User Created',
                                    userId: result._id
                                });
                            })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({message: err});
                                });
                        }
                    });
                }
            });
    } else {
        return res.status(404).json({message: 'User Email or Password is missing'});
    }
});

// DELETE User
router.delete('/:userId', (req, res) => {
    const userId = req.params.userId;
    User.find({_id: userId})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                User.remove({_id: userId})
                    .exec()
                    .then(() => {
                        res.status(200).json({message: 'User is deleted'});
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({message: err});
                    });
            } else {
                return res.status(500).json({message: 'Nothing to delete for ' + userId});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({message: err});
        });
});


// Login Registered User
router.post('/login', (req, res) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({message: 'Auth Failed'});
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({message: 'Auth Failed'});
                }
                if (result) {
                    const jwtToken = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY,
                        {expiresIn: '1h'}
                    );
                    return res.status(200).json({
                        message: 'Auth Successful',
                        token: jwtToken
                    });
                } else {
                    return res.status(401).json({message: 'Authentication Failed'});
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({message: err});
        });
});

module.exports = router;
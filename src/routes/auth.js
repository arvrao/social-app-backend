const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const emailvalidator = require("email-validator");
const jwt = require('jsonwebtoken');
const User = mongoose.model("User")
const requireLogin = require('../middlewares/requireLogin')
const vars = require('../config/vars')


router.post('/signup', (req, res) => {
    const {
        name,
        email,
        password
    } = req.body

    if (!name || !password || !email) {
        return res.status(422).json({
            err: 'Please enter all credentials'
        })
    }

    // check for valid email address
    if (!emailvalidator.validate(req.body.email)) {
        return res.status(400).json({
            err: 'Please enter a valid email address'
        })
    };

    // check if email already exists
    User.findOne({
            email: email
        })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).json({
                    err: 'User with that email already exists'
                })
            };

            // hash the password
            bcrypt.hash(password, 12).then(hashedPassword => {
                const user = new User({
                    email,
                    password: hashedPassword,
                    name
                })

                user.save().then((savedUser) => {
                    res.status(201).json({
                        message: `New user ${savedUser.name} is successfully saved to the database`
                    })
                }).catch(err => {
                    console.log(err);
                })
            })
        }).catch((err) => {
            console.log(err);
        })
})

router.post('/login', (req, res) => {
    const {
        email,
        password
    } = req.body
    if (!email || !password) {
        return res.status(422).json({
            message: 'Please enter your email or password fields'
        })
    }

    User.findOne({
        email: email
    }).then(savedUser => {
        if (!savedUser) {
            return res.status(422).json({
                error: 'Invalid email or password'
            })
        }

        bcrypt.compare(password, savedUser.password)
            .then((matchedPassword) => {
                if (matchedPassword) {
                    const token = jwt.sign({
                        id: savedUser._id,
                        name: savedUser.name
                    }, vars.jwtSecret, {
                        expiresIn: vars.jwtExpirationInterval,
                    })
                    res.status(200).json({
                        token
                    })
                } else {
                    return res.status(422).json({
                        message: 'Invalid email or password!'
                    })
                }
            })
            .catch(err => {
                // produced from our end, not client side
                console.log(err);
            })
    })
})

module.exports = router
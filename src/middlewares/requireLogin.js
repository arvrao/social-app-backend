const jwt = require('jsonwebtoken');
const vars = require('../config/vars')
const User = require('../models/user')
// important to import model rather than the file

module.exports = (req, res, next) => {
    const {
        authorization
    } = req.headers

    // * Syntax: authorization(in header) === Bearer <token>
    if (!authorization) {
        return res.status(401).json({
            error: 'You are not authorized!'
        })
    }
    const token = authorization.replace('Bearer ', '')

    jwt.verify(token, vars.jwtSecret, (err, payload) => {
        if (err) {
            return res.status(401).json({
                error: 'You are not logged in!'
            })
        }

        const {
            id
        } = payload
        //* particular id of user is stored
        req.userId = id;

        User.findById(id).then(userdata => {
            //* all values of particular user available
            req.user = userdata
            next()
        })
    })
}
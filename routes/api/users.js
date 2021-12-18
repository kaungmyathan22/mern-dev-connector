const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const User = require("../../models/User");
const config = require('config');
const jwt = require("jsonwebtoken");

// @route   POST api/user
// @desc    Register User
// @access  Public
router.post('/', [
    check('name', "Name is required.")
        .not()
        .isEmpty(),
    check('email', "Please provide a valid email.")
        .isEmail(),
    check('password', "Please enter a password with 6 or more characters.")
        .isLength({ min: 6 }),

], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: "User already exists,"
                }]
            })
        }

        const avatar = gravatar.url(email, {
            s: '200',
            r: "pg",
            d: "mm",
        })

        user = new User({
            name,
            email,
            avatar,
            password,
        })

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000,
        }, (err, token) => {
            if (err) {
                throw err
            }
            return res.status(200).json({ token })
        });

        // return res.status(201).json({ msg: "User is registered" });

    } catch (error) {

        return res.status(500).send("Server error.");
    }

})

module.exports = router;
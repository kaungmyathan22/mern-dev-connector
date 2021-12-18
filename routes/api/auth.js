const express = require('express');
const router = express.Router();
const User = require("../../models/User");
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const config = require('config');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        return res.json(user);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error")
    }
})

// @route   POST api/user
// @desc    Login a User
// @access  Public
router.post('/', [
    check('email', "Please provide a valid email.")
        .isEmail(),
    check('password', "Password is required.").exists(),

], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                errors: [{
                    msg: "Invalid credentials,"
                }]
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                errors: [{
                    msg: "Invalid credentials,"
                }]
            })
        }

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
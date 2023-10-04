const express = require('express');
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require("../../middleware/auth");

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate("user", ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: "There is no profile for this user." })
        }

        res.status(200).json(profile)
    }
    catch (error) {
        console.error(error.message)
        return res.status(500).send("Server Error");
    }
})

// @route   POST api/profile/
// @desc    Post current users profile
// @access  Private
router.post("/", [auth, [
    check('status', "Status is required").not().isEmpty(),
    check('skills', "Skill is required").not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const {
        company,
        website,
        bio,
        status,
        githubusername,
        skills,
        location,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {



        profileFields.skills = skills.split(",").map(skill => skill.trim());
    }
    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id, },
                { $set: profileFields, },
                { new: true }
            )
            return res.json(profile);
        }
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile)
    } catch (err) {
        console.error(err)
        return res.status(500).send("Server Error");
    }
})

// @route   GET api/profile/
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate("user", ['name', 'avatar']);
        res.status(200).json(profiles)
    }
    catch (error) {
        console.error(error.message)
        return res.status(500).send("Server Error");
    }
})

// @route   GET api/profile/user/:userId
// @desc    Get profile by user id
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.userId }).populate("user", ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({
                msg: "There is no profile for this user",
            })
        }
        res.status(200).json(profile)
    }
    catch (error) {
        console.error(error.message)
        return res.status(500).send("Server Error");
    }
})


// @route   DELETE api/profile/user/:userId
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id });

        await User.findOneAndRemove({ _id: req.user.id });

        await Post.deleteMany({ user: req.user.id });

        res.status(200).json({ msg: "User deleted" })
    }
    catch (error) {
        console.error(error.message)
        return res.status(500).send("Server Error");
    }
})

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put('/experience', [
    auth, [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty(),
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
    }

    try {

        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);

        await profile.save()

        return res.status(200).json(profile)
    }
    catch (error) {
        console.error(error.message)
        return res.status(500).send("Server Error");
    }
})

// @route   DELETE api/profile/experience/:experienceId
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:experienceId', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id });

        const removeIndex = profile.experience.map((item) => item.id).indexOf(req.params.experienceId);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.status(200).json(profile)
    }
    catch (error) {
        console.error(error.message)
        return res.status(500).send("Server Error");
    }
})

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put('/education', [
    auth, [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty(),
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
    }

    try {

        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);

        await profile.save()

        return res.status(200).json(profile)
    }
    catch (error) {
        console.error(error.message)
        return res.status(500).send("Server Error");
    }
})

// @route   DELETE api/profile/education/:educationId
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:educationId', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id });

        const removeIndex = profile.education.map((item) => item.id).indexOf(req.params.educationId);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.status(200).json(profile)
    }
    catch (error) {
        console.error(error.message)
        return res.status(500).send("Server Error");
    }
})

// @route   GET api/profile/github/:username
// @desc    Get user repo from github
// @access  Public
router.get('/github/:username', async (req, res) => {
    try {

        const options = {
            url: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&clien_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_SECRET}`,
            method: 'GET',
            headers: {
                'user-agent': "node.js"
            }
        }

        request(options, (error, response, body) => {

            if (error) console.error(error)

            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: "No github profile found" });
            }

            return res.json(JSON.parse(body));

        })

    }
    catch (error) {
        console.error(error.message)
        return res.status(500).send("Server Error");
    }
})

module.exports = router;
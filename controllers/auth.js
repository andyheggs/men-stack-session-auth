const User = require("../models/user.js");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// Router GET (define route):
router.get("/sign-up", (req, res) => {
    res.render("auth/sign-up.ejs");
});

router.post("/sign-up", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (userInDatabase) {
        return res.send("Username already taken.");
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.send("Password and Confirm Password must match");
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 12);
    req.body.password = hashedPassword;

    const user = await User.create(req.body);

    return res.send(`Thanks for signing up ${user.username}`);
});

// auth sign-in
router.get("/sign-in", (req, res) => {
    res.render("auth/sign-in.ejs");
});

router.post("/sign-in", async (req, res) => {
    // First, get the user from the database
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (!userInDatabase) {
        return res.send("Login failed. Please try again.");
    }

    // There is a user! Time to test their password with bcrypt
    const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password);

    if (!validPassword) {
        return res.send("Login failed. Please try again.");
    }

    // There is a user AND they had the correct password. Time to make a session!
    // Avoid storing the password, even in hashed format, in the session
    // If there is other data you want to save to `req.session.user`, do so here!
    req.session.user = {
        username: userInDatabase.username,
    };

    req.session.save(() => {
        res.redirect("/");
    });
});

router.get("/sign-out", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;

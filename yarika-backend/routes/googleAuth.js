const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Client = require('../models/Client'); // Import your User model
const jwt = require('jsonwebtoken'); // For generating JWT on successful auth

const router = express.Router();

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET_CODE,
    callbackURL: "https://yarika.in/api/auth/google/callback", // must match Google Console
    scope: ['profile', 'email'] // Request access to user's profile and email
},
async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("Google profile:", profile);
        let user = await Client.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        } else {
            // Check if a user with this email already exists (for linking accounts)
            user = await Client.findOne({ email: profile.emails[0].value });

            if (user) {
                // User exists with this email, link Google ID
                user.googleId = profile.id;
                await user.save();
                return done(null, user);
            } else {
                // No user found, create a new one
                user = new Client({
                    googleId: profile.id,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value,
                });
                await user.save();
                return done(null, user);
            }
        }
    } catch (err) {
        console.error("Google OAuth Strategy Error:", err);
        return done(err, false);
    }
}));

// Serialize and Deserialize User (required by Passport, even if not using sessions directly)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Client.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Initiate Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// Handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Redirect to your frontend after successful login
    // Include both token and user data
    const token = req.user.getSignedJwtToken();
    const userData = {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phoneNumber: req.user.phoneNumber,
    };
    
    // Encode user data as base64 to pass through URL
    const encodedUserData = Buffer.from(JSON.stringify(userData)).toString('base64');
    res.redirect(`https://yarika.in/?token=${token}&user=${encodedUserData}`);
  }
);

module.exports = router;

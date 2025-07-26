const bcrypt= require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const collection = require('./db'); // Adjust the path as needed

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        // console.log('Received credentials:', username, password);
        const user = await collection.findOne({ username });
        if (!user)
            return done(null, false, { message: 'Incorrect username.' });
        
        const isPasswordMatch = await user.compare(user.password);
        if (isPasswordMatch)
            return done(null, user);
        else
            return done(null, false, { message: 'Incorrect password.' })
    } catch (error) {
        return done(error);
    }
}));

module.exports = passport; // Export configured passport
// googleStrategy.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js'; 

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
  proxy: true // Enable if behind a reverse proxy
}, async (accessToken, refreshToken, profile, done) => {
  try {
    if (!profile || !profile.id || !profile.emails || !profile.emails[0]) {
      return done(new Error('Invalid profile data from Google'), null);
    }

    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      // Generate a random password for Google users
      const randomPassword = Math.random().toString(36).slice(-8);
      user = await User.create({
        username: profile.displayName || profile.emails[0].value.split('@')[0],
        email: profile.emails[0].value,
        googleId: profile.id,
        profilePic: profile.photos?.[0]?.value || '',
        password: randomPassword
      });
    }
    return done(null, user);
  } catch (error) {
    console.error('Google authentication error:', error);
    return done(error, null);
  }
}));

// Serialize and deserialize user instances to support login sessions.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;

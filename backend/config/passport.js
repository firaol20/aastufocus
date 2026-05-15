import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import config from '../config/environment.js';
import bcrypt from 'bcryptjs';

const cookieExtractor = (req) => {
  if (req && req.cookies && req.cookies.access_token) return req.cookies.access_token;
  return null;
};

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', session: false },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user || !user.password) return done(null, false);
        if (user.lockUntil && user.lockUntil > new Date()) return done(null, false);
        if (!user.isActive) return done(null, false);

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return done(null, false);

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor
      ]),
      secretOrKey: config.JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.userId);

        if (!user) return done(null, false);
        if (!user.isActive) return done(null, false);
        
        // Check if password was changed after token issued
        if (user.passwordChangedAt) {
          const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
          if (payload.iat < changedTimestamp) return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          return done(new Error('No email in Google profile'), null);
        }

        const email = profile.emails[0].value.toLowerCase();
        const googleId = profile.id;
        const displayName = profile.displayName || 'Unknown User';
        const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        let user = await User.findOne({ googleId: googleId });

        if (!user) {
          user = await User.findOne({ email: email });

          if (user) {
            // Link Google account to existing user
            user = await User.findByIdAndUpdate(user.id, {
              googleId,
              avatar: user.avatar || avatarUrl,
              lastLogin: new Date()
            }, { new: true });
          } else {
            // Create new user
            user = await User.create({
              googleId,
              email,
              name: displayName,
              avatar: avatarUrl,
              lastLogin: new Date()
            });
          }
        } else {
          // Update lastLogin
          user = await User.findByIdAndUpdate(user.id, { lastLogin: new Date() }, { new: true });
        }

        done(null, user);
      } catch (err) {
        console.error('Google OAuth error:', err);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;

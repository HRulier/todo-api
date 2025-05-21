import passport from "passport";
import User from "~/models/user";
import passportJWT from "passport-jwt";
import passportLocal from "passport-local";
import passportGoogleOAuth20 from "passport-google-oauth20";

import dotenv from "dotenv";
import dotEnvConfig from "./dot-env";
import HTTP_STATUS from "~/utils/http_status";
import { findOrCreateUser } from "~/services/users.services";

dotenv.config(dotEnvConfig);

const { Strategy: LocalStrategy } = passportLocal;
const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;
const { Strategy: GoogleStrategy } = passportGoogleOAuth20;

// Setting username field to email rather than username
const localOptions = {
  usernameField: "email",
  passwordField: "password",
};

// Setting up local login strategy
const localLogin = new LocalStrategy(
  localOptions,
  async (email: string, password: string, done: any) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, {
          error: "Your login details could not be verified. Please try again.",
        });
      }

      if (!user.isVerified) {
        return done(null, false, {
          error: "Email not verified.",
          status: HTTP_STATUS.FORBIDDEN,
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, {
          error: "Your login details could not be verified. Please try again.",
        });
      }

      return done(null, user);
    } catch (err) {
      console.log(err);
      return done(err);
    }
  }
);

// Setting JWT strategy options
const jwtOptions: any = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
};

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("Missing ACCESS_TOKEN_SECRET environment variable.");
}

jwtOptions.secretOrKey = process.env.ACCESS_TOKEN_SECRET;

// Setting up JWT login strategy
const jwtLogin = new JwtStrategy(
  jwtOptions,
  async (payload: any, done: (arg: any, arg2: any) => void) => {
    try {
      const user = await User.findById(payload.data._id);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
);

// Google OAuth2

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;

const googleStrategy = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/google/callback`,
    passReqToCallback: true,
  },
  async function (
    req: any,
    accessToken: any,
    refreshToken: any,
    profile: any,
    done: any
  ) {
    // console.log(accessToken, refreshToken);
    // console.log(profile);
    const user = await findOrCreateUser({
      email: profile.emails[0].value,
      profile: {
        firstName: profile.name?.familyName || "Non renseigné",
        lastName: profile.name?.givenName || "Non renseigné",
      },
    });
    return done(null, user);
  }
);

passport.use(jwtLogin);
passport.use(localLogin);
passport.use(googleStrategy);

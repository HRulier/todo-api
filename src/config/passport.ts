import passport from "passport";
import User from "~/models/user";
import passportJWT from "passport-jwt";
import passportLocal from "passport-local";
import dotenv from "dotenv";
import dotEnvConfig from "./dot-env";

dotenv.config(dotEnvConfig);

const { Strategy: LocalStrategy } = passportLocal;
const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;

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

      user.comparePassword(password, (err: any, isMatch: boolean) => {
        if (err) {
          return done(err);
        }
        if (!isMatch) {
          return done(null, false, {
            error:
              "Your login details could not be verified. Please try again.",
          });
        }

        return done(null, user);
      });
    } catch (err) {
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

if (process.env.JWT_SECRET) jwtOptions.secretOrKey = process.env.JWT_SECRET;

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

passport.use(jwtLogin);
passport.use(localLogin);

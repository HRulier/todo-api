declare module "passport-slack-oauth2" {
  import { Strategy as OAuth2Strategy } from "passport-oauth2";

  export interface Profile {
    provider: "slack";
    id: string;
    displayName?: string;
    user: {
      id: string;
      name?: string;
      email?: string;
    };
    team: {
      id: string;
      name: string;
    };
    _raw: string;
    _json: any;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL?: string;
    scope?: string | string[];
    skipUserProfile?: boolean;
    passReqToCallback?: boolean;
    authorizationURL?: string;
    tokenURL?: string;
  }

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void
  ) => void;

  export type VerifyFunctionWithRequest = (
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void
  ) => void;

  export class Strategy extends OAuth2Strategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    constructor(options: StrategyOptions, verify: VerifyFunctionWithRequest);
    name: string;
    authenticate(req: any, options?: any): void;
    userProfile(accessToken: string, done: (err?: any, profile?: any) => void): void;
  }
}

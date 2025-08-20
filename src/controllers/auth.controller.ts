import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt, { Secret } from "jsonwebtoken";
import passport from "passport";
import dotEnvConfig from "~/config/dot-env";
import HTTP_STATUS from "~/utils/http_status";
import {
  NotFoundError,
  CustomError,
  BadRequestError,
  handleError,
} from "~/utils/errors";
import { IAuthentificateRequest, IAuthController } from "~/types/auth";

import User from "~/models/user";
import { IUser } from "~/types/users";

import sendEmail from "~/utils/email";
import ResetPassword from "~/utils/email/templates/ResetPassword";
import VerifiedUserEmail from "~/utils/email/templates/VerifiedUserEmail";
import { getUserInfo } from "~/services/users.services";
import { generateAccessToken, generateRefreshToken } from "~/utils/jwt";

const ObjectId = mongoose.Types.ObjectId;
dotenv.config(dotEnvConfig);

const NotFound = new NotFoundError("The requested user was not found");

async function register(req: Request, res: Response) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const profile = req.body.profile;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError(
        "That email address is already in use.",
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }

    const verificationToken = await crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 3600000;

    const user = new User({
      email,
      password,
      verificationToken,
      verificationTokenExpires,
      profile: profile || {},
    });

    await user.save();
    const infoUser = {
      _id: user._id,
      email: user.email,
    };

    const subject = `confirmation de votre inscription`;
    const url = `${process.env.API_URL}/auth/verified-email/${verificationToken}`;

    await sendEmail(
      email,
      subject,
      VerifiedUserEmail({
        username: `${user.profile.firstName} ${user.profile.lastName}`,
        url,
      })
    );

    res.status(HTTP_STATUS.CREATED).json({
      user: infoUser,
    });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function login(req: IAuthentificateRequest, res: Response) {
  try {
    const user = await User.findById(new ObjectId(req.user?._id));
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const userInfo = await getUserInfo(user);

    const accessToken = generateAccessToken(userInfo);
    const refreshToken = generateRefreshToken(userInfo);

    await user.set({ refreshToken });
    await user.save();

    // Secure true for production, secure: true need https
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HTTP_STATUS.OK).json({
      token: accessToken,
      user: userInfo,
    });
  } catch (error: unknown) {
    console.log("catch error");
    return handleError(res, req, error);
  }
}

async function loginWithGoogle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const redirectUrl = (req.query.redirectUrl || "") as string;

    const stateObject = {
      data: {} as { redirectUrl?: string },
    };

    if (["profile"].includes(redirectUrl)) {
      stateObject.data.redirectUrl = redirectUrl;
    }

    // Encode state as base64url (URL-safe)
    const stateJson = JSON.stringify(stateObject);
    const state = Buffer.from(stateJson).toString("base64url");

    passport.authenticate("google", {
      session: false,
      scope: ["email", "profile"],
      state,
    })(req, res, next);
  } catch (error) {
    console.error("Error in loginWithGoogle:", {
      error: error instanceof Error ? error.message : "Unknown error",
      userAgent: req.get("User-Agent"),
      query: Object.keys(req.query || {}),
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: "Invalid OAuth request parameters",
    });
  }
}

async function loginWithGoogleCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("loginWithGoogleCallback");
  passport.authenticate("google", { session: false }, (err, data) => {
    if (err || !data) {
      return res.redirect(
        `${process.env.FRONT_URL}/signin?error=auth_google_failed`
      );
    }

    // Extract user data and state data from the callback
    const { user: userData, stateData } = data;

    if (!userData || !userData.token || !userData.refreshToken) {
      return res.redirect(
        `${process.env.FRONT_URL}/signin?error=auth_google_failed`
      );
    }

    const { token, refreshToken } = userData;

    // Secure true for production, secure: true need https
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // path: "/api/auth/refresh-token", // Limitation du cookie à la route de refresh
    });

    // Use custom redirect URL from state data if available
    let queryParams = `?token=${token}`;

    if (stateData?.redirectUrl) {
      queryParams += `&redirectUrl=${stateData.redirectUrl}`;
    }

    console.log(`${process.env.FRONT_URL}/auth-google-success${queryParams}`);

    return res.redirect(
      `${process.env.FRONT_URL}/auth-google-success${queryParams}`
    );
  })(req, res, next);
}

async function refresh(req: IAuthentificateRequest, res: Response) {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new CustomError("Access denied", HTTP_STATUS.FORBIDDEN);
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
      throw new CustomError("Invalid Refresh Token", HTTP_STATUS.FORBIDDEN);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as Secret);

    const userInfo = await getUserInfo(user);
    const accessToken = generateAccessToken(userInfo);
    const newRefreshToken = generateRefreshToken(userInfo);

    await user.set({ refreshToken: newRefreshToken });
    await user.save();

    // Secure true for production, secure: true need https
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HTTP_STATUS.OK).json({ token: accessToken });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function logout(req: IAuthentificateRequest, res: Response) {
  try {
    const { refreshToken } = req.cookies;

    const user = await User.findOne({
      refreshToken,
    });

    if (!user) {
      throw NotFound;
    }

    await user.set({ refreshToken: null });
    await user.save();

    res.clearCookie("refreshToken");

    return res.status(HTTP_STATUS.OK).json({
      message: "Logout success",
    });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError("Missing field");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError(
        "Can't find user for this email",
        HTTP_STATUS.NOT_FOUND
      );
    }

    const resetToken = await crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const subject = `changement de mot de passe`;
    const url = `${process.env.API_URL}/auth/reset-password/redirect/${resetToken}`;

    await sendEmail(
      email,
      subject,
      ResetPassword({
        username: `${user.profile.firstName} ${user.profile.lastName}`,
        url,
      })
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Please check your email for the link to reset your password.",
      // resetToken,
    });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function resetPassword(req: Request, res: Response) {
  try {
    const user = await User.findOne({
      resetPasswordExpires: { $gt: Date.now() },
      resetPasswordToken: req.params.token,
    });

    if (!user) {
      throw new CustomError(
        "Password reset token is invalid or has expired.",
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }

    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = 0;
    await user.save();

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Your password has been changed." });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function resetPasswordRedirect(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetPasswordExpires: { $gt: Date.now() },
      resetPasswordToken: token,
    });

    if (!user) {
      return res.redirect(`${process.env.FRONT_URL}/reset-password`);
    }

    return res.redirect(`${process.env.FRONT_URL}/reset-password/${token}`);
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function changePassword(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;

    const { newPassword, currentPassword } = req.body;

    const passwordMatch = await user.comparePassword(currentPassword);

    if (!passwordMatch) {
      throw new CustomError(
        "Current password is incorrect",
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }

    user.password = newPassword;
    await user.save();

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Your password has been changed." });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function verifiedUserEmail(req: Request, res: Response) {
  try {
    const user = await User.findOne({
      verificationTokenExpires: { $gt: Date.now() },
      verificationToken: req.params.token,
    });

    if (!user) {
      return res.redirect(`${process.env.FRONT_URL}/verification-expired`);
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = 0;
    await user.save();

    return res.redirect(`${process.env.FRONT_URL}/verified`);
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function resendVerificationEmail(req: Request, res: Response) {
  try {
    const email = req.body.email;

    const user = await User.findOne({ email });
    if (!user) {
      throw NotFound;
    }

    if (user.isVerified) {
      throw new CustomError(
        "This account has already been verified.",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const verificationToken = await crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 3600000;

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;

    await user.save();

    const subject = `confirmation de votre inscription`;
    const url = `${process.env.API_URL}/auth/verified-email/${verificationToken}`;

    await sendEmail(
      email,
      subject,
      VerifiedUserEmail({
        username: `${user.profile.firstName} ${user.profile.lastName}`,
        url,
      })
    );

    res.status(HTTP_STATUS.OK).json({
      message: "Verification link sent.",
    });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function getProfile(req: IAuthentificateRequest, res: Response) {
  if (req.user?._id) {
    const user = req.user as IUser;
    const userInfo = await getUserInfo(user);
    return res.status(HTTP_STATUS.OK).json({
      user: {
        ...userInfo,
      },
    });
  } else {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: "Can't get profile",
    });
  }
}

async function updateProfile(req: IAuthentificateRequest, res: Response) {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      throw NotFound;
    }

    const profile = req.body?.profile || user.profile || {};
    const { dailyEmailReminder } = req.body;
    const { lastName, firstName } = profile;

    await user.set({
      profile: { lastName, firstName },
      dailyEmailReminder,
    });
    await user.save();

    const userInfo = await getUserInfo(user);

    return res.status(HTTP_STATUS.OK).json({ user: userInfo });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function deleteUser(req: Request, res: Response) {
  try {
    const userId = (req.user as IUser)?._id;
    const user = await User.findByIdAndDelete(userId);
    // hooks are used to delete user's data (tasks, tags)
    if (!user) {
      throw NotFound;
    }

    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "User successfully deleted" });
  } catch (error: any) {
    return handleError(res, req, error);
  }
}

const AuthController: IAuthController = {
  register,
  login,
  loginWithGoogle,
  loginWithGoogleCallback,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  resetPasswordRedirect,
  changePassword,
  verifiedUserEmail,
  resendVerificationEmail,
  getProfile,
  updateProfile,
  deleteUser,
};

export default AuthController;

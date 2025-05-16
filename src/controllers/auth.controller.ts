import { Request, Response } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt, { Secret } from "jsonwebtoken";
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

    const user = new User({
      email,
      password,
      profile: profile || {},
    });

    await user.save();
    const infoUser = {
      _id: user._id,
      email: user.email,
    };
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
      // sameSite: 'strict',
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
      // sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HTTP_STATUS.OK).json({ token: accessToken });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function logout(req: IAuthentificateRequest, res: Response) {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({
      refreshToken,
    });

    if (!user) {
      throw NotFound;
    }

    await user.set({ refreshToken: null });
    await user.save();

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
    const url = `${req.headers.origin}/reset-password/${resetToken}`;

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

async function validateResetPasswordToken(req: Request, res: Response) {
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

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Password reset token valid" });
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
    const { lastName, firstName } = profile;

    await user.set({
      profile: { lastName, firstName },
    });
    await user.save();

    const userInfo = await getUserInfo(user);

    return res.status(HTTP_STATUS.OK).json({ user: userInfo });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

const AuthController: IAuthController = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  validateResetPasswordToken,
  getProfile,
  updateProfile,
};

export default AuthController;

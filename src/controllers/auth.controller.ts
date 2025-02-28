import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import dotEnvConfig from "~/config/dot-env";
import {
  NotFoundError,
  UnauthorizedError,
  CustomError,
  BadRequestError,
  handleError,
} from "~/utils/errors";
import { IAuthentificateRequest, IAuthController } from "~/types/auth";

import User from "~/models/user";

import sendEmail from "~/utils/email";
import ResetPassword from "~/utils/email/templates/ResetPassword";
import { getUserInfo } from "~/services/users.services";

const ObjectId = mongoose.Types.ObjectId;
dotenv.config(dotEnvConfig);

const NotFound = new NotFoundError("The requested user was not found");

// Generate JWT
// TO-DO Add issuer and audience
function generateToken(user: { _id: string; email: string }) {
  return jwt.sign(
    {
      data: user,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3, // 3 hours
    },
    process.env.JWT_SECRET || ""
  );
}

async function login(req: IAuthentificateRequest, res: Response) {
  try {
    const role = req?.user?.role;
    if (
      process.env.NODE_ENV === "production" &&
      role === "Member" &&
      req.headers.origin === process.env.URL_ADMIN
    ) {
      throw new UnauthorizedError();
    }

    const user = await User.findById(new ObjectId(req.user?._id));
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const userInfo = await getUserInfo(user);
    return res.status(200).json({
      token: `JWT ${generateToken(userInfo)}`,
      user: userInfo,
    });
  } catch (error: unknown) {
    console.log("catch error");
    return handleError(res, req, error);
  }
}

async function register(req: Request, res: Response) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const profile = req.body.profile;

    if (!email) {
      throw new CustomError("You must enter an email address.", 422);
    }

    if (!password) {
      throw new CustomError("You must enter a password.", 422);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError("That email address is already in use.", 422);
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
    res.status(201).json({
      token: `JWT ${generateToken(infoUser)}`,
      user: infoUser,
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
      throw new CustomError("Can't find user for this email", 422);
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

    return res.status(200).json({
      message: "Please check your email for the link to reset your password.",
      resetToken,
    });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function resetPassword(req: Request, res: Response) {
  try {
    if (!req.body.password) {
      throw new BadRequestError("Missing field");
    }
    const user = await User.findOne({
      resetPasswordExpires: { $gt: Date.now() },
      resetPasswordToken: req.params.token,
    });
    if (!user) {
      throw new CustomError(
        "Password reset token is invalid or has expired.",
        422
      );
    }

    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = 0;
    await user.save();

    return res.status(200).json({ message: "Your password has been changed." });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function getProfile(req: IAuthentificateRequest, res: Response) {
  if (req.user?._id) {
    const userInfo = await getUserInfo(req.user);
    return res.status(200).json({ ...userInfo });
  } else {
    return res.status(404).json({
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

    return res.status(200).json({ user: userInfo });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

const AuthController: IAuthController = {
  login,
  register,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};

export default AuthController;

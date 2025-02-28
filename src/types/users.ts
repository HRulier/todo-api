import { Document } from "mongoose";

export type UserProfile = {
  firstName: string;
  lastName: string;
};

export interface IUser extends Document {
  _id: string;
  email: string;
  profile: UserProfile;
  role: string;
  password: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: number;
  comparePassword: (
    password: string,
    cb: (err: any, isMatch: boolean) => void
  ) => void;
}

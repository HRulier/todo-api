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
  refreshToken: string;
  resetPasswordToken: string | null;
  resetPasswordExpires: number;
  createdAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

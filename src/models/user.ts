import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "~/types/users";
import Task from "~/models/task";
const Schema = mongoose.Schema;

//= ===============================
// User Schema
//= ===============================

const UserSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
      immutable: true,
    },
    password: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      required: true,
      default: "Member",
    },
    timezone: {
      type: String,
      required: true,
      default: "Europe/Paris",
    },
    googleId: {
      type: Number,
      default: null,
    },
    slackId: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    dailyEmailReminder: {
      type: Boolean,
      required: true,
      default: false,
    },
    profile: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    refreshToken: { type: String, default: null },
    verificationToken: { type: String, default: null },
    verificationTokenExpires: { type: Number, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
);

//= ===============================
// User ORM Methods
//= ===============================

// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre("save", function (next) {
  const user: any & IUser = this;
  const SALT_FACTOR = 10;

  if (!user.isModified("password")) return next();
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return next(err);
    user.resetPasswordToken = null;
    if (user.password && salt) {
      user.password = bcrypt.hashSync(user.password, salt);
    }
    next();
  });
});

UserSchema.pre("findOneAndDelete", async function (next) {
  try {
    const user = await this.model.findOne(this.getFilter());
    if (user) {
      await Task.deleteMany({ user: user._id });
    }
    next();
  } catch (err) {
    console.log("UserSchema findOneAndDelete", this.getFilter());
    console.log(err);
    next();
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password || "");
  } catch (err) {
    throw err;
  }
};

export default mongoose.model<IUser>("User", UserSchema);

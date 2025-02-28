import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "~/types/users";
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
    },
    role: {
      type: String,
      required: true,
      default: "Member",
    },
    profile: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Number },
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
  bcrypt.genSalt(SALT_FACTOR, (err, salt: string) => {
    if (err) return next(err);
    user.resetPasswordToken = null;
    if (user.password) user.password = bcrypt.hashSync(user.password, salt);
    next();
  });
});

// Method to compare password for login
UserSchema.methods.comparePassword = function (
  candidatePassword: string,
  cb: any
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch: boolean) => {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

export default mongoose.model<IUser>("User", UserSchema);

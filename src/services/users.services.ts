import { IUser } from "~/types/users";
import { generateAccessToken, generateRefreshToken } from "~/utils/jwt";
import User from "~/models/user";

const getUserInfo = async (user: IUser) => {
  return {
    _id: user._id,
    email: user.email,
    profile: user.profile,
  };
};

// Use for Signin/Signup with Google 0Auth2
const findOrCreateUser = async (userData: Partial<IUser>) => {
  try {
    const user = await User.findOne({ email: userData.email });

    if (!user) {
      throw new Error("User not found");
    }

    const userInfo = await getUserInfo(user);

    const accessToken = generateAccessToken(userInfo);
    const refreshToken = generateRefreshToken(userInfo);

    await user.set({ refreshToken });
    await user.save();

    return {
      user: userInfo,
      refreshToken,
      token: accessToken,
    };
    // return done(null, {
    //   user: userInfo,
    //   refreshToken,
    //   token: accessToken,
    // });
  } catch (err) {
    console.log(err);
    return err;
  }
};

export { getUserInfo, findOrCreateUser };

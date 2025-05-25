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
    let userInfo: any = {};
    let accessToken: string;
    let refreshToken: string;

    if (!user) {
      accessToken = generateAccessToken({
        _id: userInfo._id,
        email: userInfo.email,
      });
      refreshToken = generateRefreshToken(userInfo);

      const user = new User({
        email: userData.email,
        password: null,
        googleId: userData.googleId,
        profile: userData.profile || {},
        isVerified: true,
        refreshToken,
      });

      await user.save();
      userInfo = await getUserInfo(user);
    } else {
      userInfo = await getUserInfo(user);

      accessToken = generateAccessToken({
        _id: userInfo._id,
        email: userInfo.email,
      });
      refreshToken = generateRefreshToken(userInfo);

      await user.set({ refreshToken, googleId: userData.googleId });
      await user.save();
    }

    return {
      user: userInfo,
      refreshToken,
      token: accessToken,
    };
  } catch (err) {
    console.log(err);
    return err;
  }
};

export { getUserInfo, findOrCreateUser };

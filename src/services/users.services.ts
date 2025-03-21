import { IUser } from "~/types/users";

const getUserInfo = async (user: IUser) => {
  return {
    _id: user._id,
    email: user.email,
    profile: user.profile,
  };
};

export { getUserInfo };

const getUserInfo = async (user: any) => {
  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    profile: user.profile,
    createdAt: user.createdAt,
  };
};

export { getUserInfo };

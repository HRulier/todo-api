import jwt from "jsonwebtoken";

// Generate JWT
// TO-DO Add issuer and audience
function generateToken(user: { _id: string; email: string }): string {
  return jwt.sign(
    {
      data: user,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3, // 3 hours
    },
    process.env.JWT_SECRET || ""
  );
}

export { generateToken };

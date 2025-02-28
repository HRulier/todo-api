import rateLimit from "express-rate-limit";

// LIMIT TO 20 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 15, // 20 requests
  skipSuccessfulRequests: true,
});

export default {
  authLimiter,
};

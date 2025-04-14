import { rateLimit } from "express-rate-limit";
export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  limit: 20, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  handler: function (req, res) {
    res.status(429).send({
      status: 429,
      message: "Too many requests!",
    });
  },
  skip: (req, res) => {
    if (req.ip === "::ffff:127.0.0.1") return true;
    return false;
  },
});
export const queue = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 10,
  keyGenerator: function (req, res) {
    return "global"; // Use a fixed key for all users (this makes it global)
  },
  handler: function (req, res, next) {
    setTimeout(() => {
      next();
    }, 60 * 1000);
  },
});

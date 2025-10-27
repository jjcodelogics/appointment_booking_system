// Simple in-memory rate limiter for admin endpoints
// In production, use Redis or another distributed store

const requestCounts = new Map();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > data.windowMs) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean up every minute

export const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // max requests per window
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, {
        count: 1,
        resetTime: now,
        windowMs,
      });
      return next();
    }

    const data = requestCounts.get(key);

    if (now - data.resetTime > windowMs) {
      // Reset the window
      data.count = 1;
      data.resetTime = now;
      requestCounts.set(key, data);
      return next();
    }

    if (data.count >= max) {
      return res.status(statusCode).json({ msg: message });
    }

    data.count++;
    requestCounts.set(key, data);
    next();
  };
};

// Stricter rate limit for login endpoints
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: 'Too many login attempts. Please try again later.',
});

// Rate limit for admin endpoints
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: 'Too many requests to admin endpoints. Please slow down.',
});

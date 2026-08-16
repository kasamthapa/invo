import rateLimit from 'express-rate-limit'

/**
 * Throttles login/register/refresh attempts per IP to slow down brute-force
 * and account-enumeration attempts. Generous enough that a real seller
 * mistyping their password a few times never notices it.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in a few minutes.' },
})

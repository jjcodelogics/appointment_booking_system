// This file consolidates authentication and authorization middleware.

/**
 * Authentication: Checks if a user is logged in via a valid session.
 * Relies on Passport to populate req.isAuthenticated().
 */
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ msg: 'Unauthorized. Please log in.' });
};

/**
 * Authorization: Checks if the authenticated user has one of the allowed roles.
 * @param {string[]} allowedRoles - An array of roles that are permitted access.
 * e.g., canAccess(['admin', 'manager'])
 */
export const canAccess = (allowedRoles) => {
  return (req, res, next) => {
    // This middleware should run *after* isAuthenticated, so req.user is available.
    if (req.user && allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ msg: 'Forbidden: You do not have the required permissions.' });
  };
};
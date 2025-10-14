//exports functions like `isAdmin`, `isManager`, or `canAccess(allowedRoles) from routes to check user roles and permissions.

module.exports = {
  isAdmin: (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  },

  isManager: (req, res, next) => {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
      return next();
    }
    return res.status(403).json({ msg: 'Access denied. Managers only.' });
  }, 

  canAccess: (allowedRoles) => {
    return (req, res, next) => {
      if (req.user && allowedRoles.includes(req.user.role)) {
        return next();
      }
      return res.status(403).json({ msg: 'Access denied.' });
    };
  },
};
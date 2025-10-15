//exports functions like `isAdmin`, `isManager`, or `canAccess(allowedRoles) from routes to check user roles and permissions.

export function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ msg: 'Access denied. Admins only.' });
}
export function canAccess(allowedRoles) {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ msg: 'Access denied.' });
  };
}
const isAuthenticated = (req, res, next) => {
    // req.isAuthenticated() is the function added by Passport when using sessions.
    if (req.isAuthenticated()) {
        return next();
    }
    
    // If authentication fails, send an unauthorized response.
    res.status(401).json({ msg: 'Authentication required. You are not logged in.' });
};

export default {
    isAuthenticated
};
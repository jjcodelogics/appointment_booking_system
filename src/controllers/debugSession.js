import { Router } from 'express';
const router = Router();

// GET /debug/debug-session
router.get('/debug-session', (req, res) => {
  res.json({
    ok: true,
    sessionID: req.sessionID,
    session: req.session || null,
    passportData: req.session?.passport || null,
    isAuthenticated: typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false,
    user: req.user || null,
    headersCookie: req.headers.cookie || null,
  });
});

export default router;
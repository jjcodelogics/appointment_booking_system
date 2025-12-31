/**
 * Security Headers Middleware
 * 
 * Implements comprehensive HTTP security headers to protect against common web vulnerabilities:
 * - Strict-Transport-Security (HSTS): Forces HTTPS connections
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-Frame-Options: Prevents clickjacking attacks
 * - Content-Security-Policy (CSP): Mitigates XSS and injection attacks
 * - Referrer-Policy: Controls referrer information leakage
 * - Permissions-Policy: Controls browser features and APIs
 */

const securityHeaders = (req, res, next) => {
  // Strict-Transport-Security (HSTS)
  // Tells browsers to only access the site over HTTPS for the next 2 years
  // includeSubDomains: applies to all subdomains
  // preload: allows inclusion in browser HSTS preload lists
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // X-Content-Type-Options
  // Prevents browsers from MIME-sniffing a response away from the declared content-type
  // This reduces exposure to drive-by download attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  // Prevents the page from being embedded in iframes to protect against clickjacking
  // DENY: page cannot be displayed in a frame at all
  // Alternative: SAMEORIGIN (allows framing from same origin only)
  res.setHeader('X-Frame-Options', 'DENY');

  // Content-Security-Policy (CSP)
  // Define trusted sources for content to prevent XSS and data injection attacks
  // This policy is strict but allows necessary external resources for the app
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' " + (process.env.FRONTEND_URL || "'self'"),
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests"
  ];
  
  // In development, be more lenient with CSP to allow hot reload and dev tools
  if (process.env.NODE_ENV !== 'production') {
    // Remove upgrade-insecure-requests in dev to allow localhost HTTP
    const upgradeIndex = cspDirectives.indexOf("upgrade-insecure-requests");
    if (upgradeIndex > -1) {
      cspDirectives.splice(upgradeIndex, 1);
    }
    // Add localhost connections for dev server
    cspDirectives.push("connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*");
  }
  
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  // Referrer-Policy
  // Controls how much referrer information is sent with requests
  // strict-origin-when-cross-origin: send full URL for same-origin, only origin for cross-origin HTTPS, nothing for HTTP
  // This balances privacy with analytics needs
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy (formerly Feature-Policy)
  // Controls which browser features and APIs can be used
  // Disables potentially dangerous features that the app doesn't need
  const permissionsPolicyDirectives = [
    'geolocation=()',           // Disable geolocation
    'microphone=()',            // Disable microphone access
    'camera=()',                // Disable camera access
    'payment=()',               // Disable payment request API
    'usb=()',                   // Disable USB access
    'magnetometer=()',          // Disable magnetometer
    'gyroscope=()',             // Disable gyroscope
    'accelerometer=()',         // Disable accelerometer
    'ambient-light-sensor=()',  // Disable ambient light sensor
    'autoplay=()',              // Disable autoplay
    'encrypted-media=()',       // Disable encrypted media
    'picture-in-picture=()',    // Disable picture-in-picture
    'display-capture=()'        // Disable screen capture
  ];
  
  res.setHeader('Permissions-Policy', permissionsPolicyDirectives.join(', '));

  // Additional security headers for defense in depth
  
  // X-XSS-Protection (legacy, but still good to include)
  // Enables XSS filter in older browsers (IE, older Chrome/Safari)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // X-Download-Options
  // Prevents IE from executing downloads in the site's context
  res.setHeader('X-Download-Options', 'noopen');

  // X-Permitted-Cross-Domain-Policies
  // Restricts Adobe Flash and PDF cross-domain requests
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  next();
};

export default securityHeaders;

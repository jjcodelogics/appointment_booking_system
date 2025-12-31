# Security Headers Implementation

## Overview
This document details the comprehensive security headers implemented to protect the appointment booking system against common web vulnerabilities and attacks.

## Implemented Security Headers

### 1. Strict-Transport-Security (HSTS)
**Purpose**: Forces all connections to use HTTPS, preventing protocol downgrade attacks and cookie hijacking.

**Implementation**:
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Protection Details**:
- `max-age=63072000`: Enforces HTTPS for 2 years (730 days)
- `includeSubDomains`: Applies the policy to all subdomains
- `preload`: Allows submission to browser HSTS preload lists
- **Only enabled in production** to allow local HTTP development

**Threats Mitigated**:
- Man-in-the-middle (MITM) attacks
- SSL stripping attacks
- Session hijacking
- Cookie theft

### 2. X-Content-Type-Options
**Purpose**: Prevents MIME type sniffing, forcing browsers to respect declared content types.

**Implementation**:
```
X-Content-Type-Options: nosniff
```

**Protection Details**:
- Stops browsers from interpreting files as a different MIME type than declared
- Prevents execution of malicious scripts disguised as images or other file types

**Threats Mitigated**:
- Drive-by download attacks
- MIME confusion attacks
- XSS via content type manipulation

### 3. X-Frame-Options
**Purpose**: Prevents the application from being embedded in iframes, protecting against clickjacking.

**Implementation**:
```
X-Frame-Options: DENY
```

**Protection Details**:
- `DENY`: Completely prevents the page from being displayed in any frame
- Alternative option `SAMEORIGIN` would allow framing from same origin only

**Threats Mitigated**:
- Clickjacking attacks
- UI redressing attacks
- Invisible frame attacks

### 4. Content-Security-Policy (CSP)
**Purpose**: Defines trusted sources for content, preventing XSS and data injection attacks.

**Implementation**:
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' [FRONTEND_URL];
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests
```

**Protection Details**:
- `default-src 'self'`: Only allow resources from same origin by default
- `script-src`: Allow scripts from self and specific trusted CDNs (unpkg, jsdelivr)
- `style-src`: Allow styles from self and Google Fonts
- `font-src`: Allow fonts from self and Google Fonts
- `img-src`: Allow images from self, data URIs, and any HTTPS source
- `connect-src`: Restrict API calls to self and configured frontend URL
- `frame-ancestors 'none'`: Modern alternative to X-Frame-Options
- `base-uri 'self'`: Prevent base tag injection
- `form-action 'self'`: Forms can only submit to same origin
- `object-src 'none'`: Block plugins (Flash, Java, etc.)
- `upgrade-insecure-requests`: Automatically upgrade HTTP to HTTPS (production only)

**Development Mode**:
- Removes `upgrade-insecure-requests` to allow localhost HTTP
- Adds WebSocket support for hot module replacement: `ws://localhost:* wss://localhost:*`

**Threats Mitigated**:
- Cross-Site Scripting (XSS)
- Data injection attacks
- Malicious script execution
- Unauthorized resource loading
- Mixed content vulnerabilities

### 5. Referrer-Policy
**Purpose**: Controls how much referrer information is sent with requests.

**Implementation**:
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Protection Details**:
- Same-origin requests: Send full URL as referrer
- Cross-origin HTTPS→HTTPS: Send origin only (no path)
- HTTPS→HTTP: Send nothing (prevent information leakage)
- Balances privacy with legitimate analytics needs

**Threats Mitigated**:
- Information leakage via referrer headers
- User privacy violations
- Sensitive URL parameter exposure
- Cross-origin tracking

### 6. Permissions-Policy
**Purpose**: Controls which browser features and APIs can be used by the application.

**Implementation**:
```
Permissions-Policy: 
  geolocation=(), 
  microphone=(), 
  camera=(), 
  payment=(), 
  usb=(), 
  magnetometer=(), 
  gyroscope=(), 
  accelerometer=(), 
  ambient-light-sensor=(), 
  autoplay=(), 
  encrypted-media=(), 
  picture-in-picture=(), 
  display-capture=()
```

**Protection Details**:
- All potentially dangerous features disabled with `()`
- Reduces attack surface by blocking unused browser APIs
- Prevents malicious scripts from accessing device features
- Protects user privacy

**Threats Mitigated**:
- Unauthorized device access
- Privacy invasion
- Sensor data leakage
- Phishing via spoofed permissions

## Additional Security Headers

### X-XSS-Protection (Legacy)
```
X-XSS-Protection: 1; mode=block
```
Enables XSS filtering in older browsers (IE, older Chrome/Safari). Modern browsers rely on CSP, but this provides defense-in-depth.

### X-Download-Options
```
X-Download-Options: noopen
```
Prevents Internet Explorer from executing downloads in the site's context.

### X-Permitted-Cross-Domain-Policies
```
X-Permitted-Cross-Domain-Policies: none
```
Restricts Adobe Flash and PDF cross-domain requests.

## Architecture

### Implementation Location
- **Middleware**: `/src/middleware/securityHeaders.js`
- **Integration**: Applied in `server.js` before all routes
- **Helmet**: Used alongside for additional protections

### Middleware Order
```javascript
1. securityHeaders (custom security headers)
2. helmet (additional security features)
3. CORS
4. Body parsers
5. Static file serving
6. Cookie parser
7. Session middleware
8. Passport authentication
9. CSRF protection
10. Application routes
```

This order ensures security headers are applied to all responses, including error responses.

## Testing Security Headers

### Using curl
```bash
# Test all security headers
curl -I https://your-domain.com

# Test specific header
curl -I https://your-domain.com | grep "Strict-Transport-Security"
```

### Online Security Scanners
- [Security Headers](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- [Qualys SSL Labs](https://www.ssllabs.com/ssltest/)

### Expected Results
All security headers should be present in the response with correct values. Grade should be A+ on security scanners.

## Browser Compatibility

| Header | Chrome | Firefox | Safari | Edge | IE11 |
|--------|--------|---------|--------|------|------|
| HSTS | ✅ | ✅ | ✅ | ✅ | ✅ (11+) |
| X-Content-Type-Options | ✅ | ✅ | ✅ | ✅ | ✅ (8+) |
| X-Frame-Options | ✅ | ✅ | ✅ | ✅ | ✅ (8+) |
| CSP | ✅ | ✅ | ✅ | ✅ | ✅ (10+, limited) |
| Referrer-Policy | ✅ | ✅ | ✅ | ✅ | ❌ |
| Permissions-Policy | ✅ | ✅ | ✅ | ✅ | ❌ |

## Environment-Specific Behavior

### Production
- All headers enabled
- HSTS enabled with preload
- `upgrade-insecure-requests` in CSP
- Strict CSP policies
- Cookie security flags: `secure=true`, `sameSite=none`

### Development
- All headers enabled except:
  - HSTS disabled (allows localhost HTTP)
  - No `upgrade-insecure-requests` in CSP
  - Relaxed CSP for hot reload: `ws://localhost:*`
- Cookie security flags: `secure=false`, `sameSite=lax`

## Maintenance & Updates

### Updating CSP
When adding new external resources (CDNs, fonts, APIs):
1. Add domain to appropriate CSP directive in `/src/middleware/securityHeaders.js`
2. Test in development
3. Monitor browser console for CSP violations
4. Deploy to production

### Monitoring CSP Violations
Consider implementing CSP reporting:
```javascript
"report-uri /api/csp-violations"
```

### Regular Security Audits
- Review headers quarterly
- Update to latest security best practices
- Check for new browser security features
- Monitor CVE databases for new vulnerabilities

## References
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Security Headers Scanner](https://securityheaders.com/)

## Compliance
These headers help meet requirements for:
- OWASP Top 10
- PCI DSS 6.5.10
- GDPR (privacy protection)
- SOC 2 Type II
- ISO 27001

## Support
For security concerns or questions, contact the security team or review SECURITY.md in the repository root.

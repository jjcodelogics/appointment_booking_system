// Audit logging service for admin actions
// Logs admin actions with redacted sensitive data for security and compliance

const sanitize = obj => {
  if (!obj) return obj;
  const sanitized = { ...obj };

  // Redact sensitive fields
  const sensitiveFields = ['password', 'ssn', 'creditCard', 'cvv'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

export const logAdminAction = (action, userId, userEmail, targetData = {}, result = 'success') => {
  const timestamp = new Date().toISOString();
  const sanitizedData = sanitize(targetData);

  const logEntry = {
    timestamp,
    action,
    adminUserId: userId,
    adminUserEmail: userEmail,
    targetData: sanitizedData,
    result,
  };

  // In production, you should log to a persistent store (database, file, external service)
  // For now, we'll use console.log with a clear prefix for audit logs
  console.log('[AUDIT]', JSON.stringify(logEntry));

  return logEntry;
};

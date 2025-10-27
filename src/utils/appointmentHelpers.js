// Small helper utilities to keep route handlers focused on request flow

export function toUtcPlus2(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return new Date(date.getTime() + 2 * 60 * 60 * 1000);
}

export function isBusinessOpen(date) {
  // Accept either a Date or (day, hour) semantics by receiving a Date object
  if (!(date instanceof Date)) date = new Date(date);
  const day = date.getDay();
  const hour = date.getHours();

  // Sunday (0) or Monday (1) are closed
  if (day === 0 || day === 1) return false;
  // Tue-Fri (2-5) from 9 AM to 7 PM (19:00)
  if (day >= 2 && day <= 5) {
    return hour >= 9 && hour < 19;
  }
  // Saturday (6) from 8 AM to 5 PM (17:00)
  if (day === 6) {
    return hour >= 8 && hour < 17;
  }
  return false;
}

export function isInPastUtcPlus2(date) {
  const d = toUtcPlus2(date);
  const nowUtcPlus2 = toUtcPlus2(new Date());
  return d <= nowUtcPlus2;
}

export function buildServiceQuery({ gender, cut, washing, coloring }) {
  const serviceQuery = { gender_target: gender };
  if (cut) serviceQuery.cutting = true;
  if (washing) serviceQuery.washing = true;
  if (coloring) serviceQuery.coloring = true;
  return serviceQuery;
}

export async function findCompatibleService(ServiceModel, query) {
  return ServiceModel.findOne({
    where: query,
    order: [['cutting', 'DESC'], ['washing', 'DESC'], ['coloring', 'DESC']],
  });
}
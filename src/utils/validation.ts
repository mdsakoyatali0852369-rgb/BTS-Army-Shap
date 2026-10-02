export function validateBangladeshiPhone(phone: string): boolean {
  if (!phone) return false;
  // Cleans spaces, hyphens, and +88 prefix
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  const normalized = cleaned.startsWith('88') ? cleaned.slice(2) : cleaned;
  // Must match 01XXXXXXXXX (11 digits, starting with 013-019)
  return /^01[3-9]\d{8}$/.test(normalized);
}

export function validateEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

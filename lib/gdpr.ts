export function maskEmail(email: string | null): string {
  if (!email) return "***";
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string | null): string {
  if (!phone) return "***";
  return phone.slice(0, 4) + "*".repeat(Math.max(0, phone.length - 4));
}

export function logSafe(label: string, data: Record<string, unknown>) {
  const safe = { ...data };
  if ("email" in safe) safe.email = maskEmail(safe.email as string);
  if ("phone" in safe) safe.phone = maskPhone(safe.phone as string);
  console.log(label, safe);
}
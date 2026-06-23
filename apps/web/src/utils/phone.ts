export function formatWhatsApp(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  return cleaned;
}

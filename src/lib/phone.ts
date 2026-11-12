const MOROCCO_MOBILE = /^(?:6|7)\d{8}$/;
const MOROCCO_LANDLINE = /^5\d{8}$/;

export function normalizeMoroccanPhone(input: string): string {
  const compact = input.trim().replace(/[\s()-]/g, "");
  let national: string;

  if (compact.startsWith("+212")) national = compact.slice(4);
  else if (compact.startsWith("00212")) national = compact.slice(5);
  else if (compact.startsWith("0")) national = compact.slice(1);
  else national = compact;

  if (!MOROCCO_MOBILE.test(national) && !MOROCCO_LANDLINE.test(national)) {
    throw new Error("INVALID_MOROCCAN_PHONE");
  }
  return `+212${national}`;
}

export function displayMoroccanPhone(normalizedPhone: string): string {
  const normalized = normalizeMoroccanPhone(normalizedPhone);
  const national = normalized.slice(4);
  return `0${national.slice(0, 1)} ${national.slice(1, 3)} ${national.slice(3, 5)} ${national.slice(5, 7)} ${national.slice(7)}`;
}

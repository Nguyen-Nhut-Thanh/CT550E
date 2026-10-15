export function displayBirthday(value: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : value;
}

export function formatBirthdayInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join("/");
}

/** Returns null for invalid input; empty birthdays remain optional. */
export function parseBirthday(value: string): string | null {
  if (!value.trim()) return "";
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(displayBirthday(value));
  if (!match) return null;
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number(year) < 1900 || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return null;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return iso <= today ? iso : null;
}

import { getTodayVietnamString } from "@/lib/utils/dateTime";
import type { TravelerType } from "shared";

export function displayBirthday(value: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : value;
}

export function formatBirthdayInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join("/");
}

/** Returns null for invalid input; empty birthdays remain optional or empty string. */
export function parseBirthday(value: string): string | null {
  if (!value.trim()) return "";
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(displayBirthday(value));
  if (!match) return null;
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(`${iso}T00:00:00Z`);
  if (
    Number(year) < 1900 ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== iso
  )
    return null;
  const today = getTodayVietnamString();
  return iso <= today ? iso : null;
}

export function subtractYears(baseDate: Date, years: number): Date {
  const y = baseDate.getFullYear() - years;
  const m = baseDate.getMonth();
  const d = baseDate.getDate();
  const maxDays = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, Math.min(d, maxDays), 0, 0, 0, 0);
}

export function formatVNDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export interface AgeCutoffs {
  baseDate: Date;
  maxAdultBirthDate: Date;
  minChildBirthDate: Date;
  maxChildBirthDate: Date;
  minInfantBirthDate: Date;
  maxInfantBirthDate: Date;
  maxAdultStr: string;
  minChildStr: string;
  maxChildStr: string;
  minInfantStr: string;
}

export function getAgeCutoffs(departureDateInput?: string | Date | null): AgeCutoffs {
  let baseDate: Date;
  if (departureDateInput) {
    baseDate = new Date(departureDateInput);
    if (isNaN(baseDate.getTime())) baseDate = new Date();
  } else {
    baseDate = new Date();
  }
  baseDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, 0);

  // Adult: >= 12 tuổi tính đến ngày khởi hành. Sinh vào hoặc trước: baseDate - 12 năm.
  const maxAdultBirthDate = subtractYears(baseDate, 12);

  // Child: 2 <= tuổi < 12. Sinh từ 1 ngày sau maxAdultBirthDate đến baseDate - 2 năm.
  const minChildBirthDate = new Date(
    maxAdultBirthDate.getFullYear(),
    maxAdultBirthDate.getMonth(),
    maxAdultBirthDate.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  const maxChildBirthDate = subtractYears(baseDate, 2);

  // Infant: < 2 tuổi. Sinh sau maxChildBirthDate (1 ngày sau maxChildBirthDate) đến ngày khởi hành.
  const minInfantBirthDate = new Date(
    maxChildBirthDate.getFullYear(),
    maxChildBirthDate.getMonth(),
    maxChildBirthDate.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  const maxInfantBirthDate = baseDate;

  return {
    baseDate,
    maxAdultBirthDate,
    minChildBirthDate,
    maxChildBirthDate,
    minInfantBirthDate,
    maxInfantBirthDate,
    maxAdultStr: formatVNDate(maxAdultBirthDate),
    minChildStr: formatVNDate(minChildBirthDate),
    maxChildStr: formatVNDate(maxChildBirthDate),
    minInfantStr: formatVNDate(minInfantBirthDate),
  };
}

export function getTravelerAgeRequirementText(
  type: TravelerType,
  departureDateInput?: string | Date | null,
): string {
  const cutoffs = getAgeCutoffs(departureDateInput);
  if (type === "adult") {
    return `Người lớn sinh trước ngày ${cutoffs.maxAdultStr}`;
  }
  if (type === "child") {
    return `Trẻ em sinh từ ngày ${cutoffs.minChildStr} đến ngày ${cutoffs.maxChildStr}`;
  }
  return `Em bé sinh sau ngày ${cutoffs.maxChildStr}`;
}

export function validateTravelerAge(
  birthdayStr: string,
  type: TravelerType,
  departureDateInput?: string | Date | null,
): { valid: boolean; message?: string } {
  if (!birthdayStr || !birthdayStr.trim()) {
    return { valid: false, message: "Vui lòng nhập ngày sinh." };
  }
  const iso = parseBirthday(birthdayStr);
  if (!iso) {
    return {
      valid: false,
      message: "Ngày sinh không đúng định dạng (dd/mm/yyyy) hoặc không hợp lệ.",
    };
  }

  const [y, m, d] = iso.split("-").map(Number);
  const bDate = new Date(y, m - 1, d, 0, 0, 0, 0);
  const cutoffs = getAgeCutoffs(departureDateInput);

  if (type === "adult") {
    if (bDate.getTime() > cutoffs.maxAdultBirthDate.getTime()) {
      return {
        valid: false,
        message: `Người lớn phải sinh trước hoặc vào ngày ${cutoffs.maxAdultStr} (từ 12 tuổi trở lên).`,
      };
    }
  } else if (type === "child") {
    if (
      bDate.getTime() < cutoffs.minChildBirthDate.getTime() ||
      bDate.getTime() > cutoffs.maxChildBirthDate.getTime()
    ) {
      return {
        valid: false,
        message: `Trẻ em phải sinh từ ngày ${cutoffs.minChildStr} đến ngày ${cutoffs.maxChildStr} (từ 2 đến dưới 12 tuổi).`,
      };
    }
  } else if (type === "infant") {
    if (bDate.getTime() < cutoffs.minInfantBirthDate.getTime()) {
      return {
        valid: false,
        message: `Em bé phải sinh sau ngày ${cutoffs.maxChildStr} (dưới 2 tuổi).`,
      };
    }
    if (bDate.getTime() > cutoffs.maxInfantBirthDate.getTime()) {
      return {
        valid: false,
        message: "Ngày sinh em bé không thể sau ngày khởi hành.",
      };
    }
  }

  return { valid: true };
}

export function isDayDisabled(
  year: number,
  month: number,
  day: number,
  type: TravelerType,
  cutoffs: AgeCutoffs,
): boolean {
  const d = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (type === "adult") {
    return d.getTime() > cutoffs.maxAdultBirthDate.getTime() || year < 1920;
  }
  if (type === "child") {
    return (
      d.getTime() < cutoffs.minChildBirthDate.getTime() ||
      d.getTime() > cutoffs.maxChildBirthDate.getTime()
    );
  }
  return (
    d.getTime() < cutoffs.minInfantBirthDate.getTime() ||
    d.getTime() > cutoffs.maxInfantBirthDate.getTime()
  );
}

export function isMonthDisabled(
  year: number,
  month: number,
  type: TravelerType,
  cutoffs: AgeCutoffs,
): boolean {
  const first = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const last = new Date(year, month, 0, 0, 0, 0, 0);

  if (type === "adult") {
    return first.getTime() > cutoffs.maxAdultBirthDate.getTime() || year < 1920;
  }
  if (type === "child") {
    return (
      last.getTime() < cutoffs.minChildBirthDate.getTime() ||
      first.getTime() > cutoffs.maxChildBirthDate.getTime()
    );
  }
  return (
    last.getTime() < cutoffs.minInfantBirthDate.getTime() ||
    first.getTime() > cutoffs.maxInfantBirthDate.getTime()
  );
}

export function isYearDisabled(
  year: number,
  type: TravelerType,
  cutoffs: AgeCutoffs,
): boolean {
  if (type === "adult") {
    return (
      year > cutoffs.maxAdultBirthDate.getFullYear() ||
      year < 1920
    );
  }
  if (type === "child") {
    return (
      year < cutoffs.minChildBirthDate.getFullYear() ||
      year > cutoffs.maxChildBirthDate.getFullYear()
    );
  }
  return (
    year < cutoffs.minInfantBirthDate.getFullYear() ||
    year > cutoffs.maxInfantBirthDate.getFullYear()
  );
}

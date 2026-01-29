import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Payment window helpers
export type DomesticPaymentDay = 5 | 15 | 25;
export type InternationalPaymentDay = 10 | 20 | "ultimo";
export type PaymentWindowDay = DomesticPaymentDay | InternationalPaymentDay;

/**
 * Returns the last business day of the given month/year.
 * Simple approach: goes backwards from the last day until hitting Mon-Fri.
 */
function getLastBusinessDayOfMonth(year: number, month: number): Date {
  // month + 1 with day 0 gives last day of `month`
  let lastDay = new Date(year, month + 1, 0);
  while (lastDay.getDay() === 0 || lastDay.getDay() === 6) {
    lastDay.setDate(lastDay.getDate() - 1);
  }
  return lastDay;
}

const diffInDays = (a: Date, b: Date) =>
  Math.floor((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));

/**
 * Returns the next valid payment date following fixed windows
 * with a minimum advance in days from the open date.
 *
 * For domestic (BRL): windows are 5, 15, 25.
 * For international (non-BRL): windows are 10, 20, "ultimo" (last business day).
 *
 * If the selected window is too close, moves to the next window in
 * chronological order; if all windows in the current month fail, moves
 * to the first window of the following month.
 *
 * If `isOutsidePaymentWindow` is true, no adjustment is made.
 */
export function getNextValidPaymentDate(options: {
  openDate: Date;
  selectedDay: PaymentWindowDay;
  minDaysAdvance: number;
  isOutsidePaymentWindow?: boolean;
  isBRL?: boolean;
}): { day: PaymentWindowDay; date: Date } {
  const {
    openDate,
    selectedDay,
    minDaysAdvance,
    isOutsidePaymentWindow,
    isBRL = true,
  } = options;

  const baseYear = openDate.getFullYear();
  const baseMonth = openDate.getMonth();

  // Helper to build date from a window value
  const toDate = (d: PaymentWindowDay, year: number, month: number): Date => {
    if (d === "ultimo") {
      return getLastBusinessDayOfMonth(year, month);
    }
    return new Date(year, month, d);
  };

  // If outside payment window, return original selection without adjustment
  if (isOutsidePaymentWindow) {
    return {
      day: selectedDay,
      date: toDate(selectedDay, baseYear, baseMonth),
    };
  }

  // Define window order based on currency type
  const windows: PaymentWindowDay[] = isBRL ? [5, 15, 25] : [10, 20, "ultimo"];

  // Build candidates: from selected window onwards in this month, then wrap to next month
  const startIdx = windows.indexOf(selectedDay);
  const sameMonthOrder = startIdx >= 0 ? windows.slice(startIdx) : windows;

  interface Candidate {
    day: PaymentWindowDay;
    date: Date;
  }
  const candidates: Candidate[] = [];

  for (const d of sameMonthOrder) {
    candidates.push({ day: d, date: toDate(d, baseYear, baseMonth) });
  }

  // Fallback: first window of next month
  const firstWindow = windows[0];
  candidates.push({
    day: firstWindow,
    date: toDate(firstWindow, baseYear, baseMonth + 1),
  });

  for (const c of candidates) {
    if (diffInDays(c.date, openDate) >= minDaysAdvance) {
      return c;
    }
  }

  // Final fallback
  return candidates[candidates.length - 1];
}

// ============================================================================
// CPF/CNPJ Validation
// ============================================================================

/**
 * Remove non-numeric characters from a string
 */
function cleanNumericString(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Validate Brazilian CPF (Cadastro de Pessoas Físicas)
 * CPF format: 11 digits
 * Algorithm: uses check digits calculated with specific weights
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cleanNumericString(cpf);

  // Check if it has exactly 11 digits
  if (cleaned.length !== 11) {
    return false;
  }

  // Check for known invalid sequences (all digits the same)
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  // Validate check digits
  let sum = 0;
  let remainder: number;

  // First check digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cleaned.substring(9, 10))) {
    return false;
  }

  // Second check digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cleaned.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Validate Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica)
 * CNPJ format: 14 digits
 * Algorithm: uses check digits calculated with specific weights
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cleanNumericString(cnpj);

  // Check if it has exactly 14 digits
  if (cleaned.length !== 14) {
    return false;
  }

  // Check for known invalid sequences (all digits the same)
  if (/^(\d)\1{13}$/.test(cleaned)) {
    return false;
  }

  // Validate first check digit
  let length = cleaned.length - 2;
  let numbers = cleaned.substring(0, length);
  const digits = cleaned.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }

  // Validate second check digit
  length = length + 1;
  numbers = cleaned.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return false;
  }

  return true;
}

/**
 * Validate document based on type (CPF or CNPJ)
 */
export function validateDocument(value: string, type: "CPF" | "CNPJ"): boolean {
  if (type === "CPF") {
    return validateCPF(value);
  }
  return validateCNPJ(value);
}

/**
 * Format CPF: 000.000.000-00
 */
export function formatCPF(cpf: string): string {
  const cleaned = cleanNumericString(cpf);
  if (cleaned.length !== 11) {
    return cpf;
  }
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Format CNPJ: 00.000.000/0000-00
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cleanNumericString(cnpj);
  if (cleaned.length !== 14) {
    return cnpj;
  }
  return cleaned.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
}

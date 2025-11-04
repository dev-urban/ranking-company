import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  // Parse the date string directly without timezone conversion
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}
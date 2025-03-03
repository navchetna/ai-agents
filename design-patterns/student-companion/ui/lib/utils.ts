import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export const DATA_PREP_URL = process.env.NEXT_PUBLIC_DATA_PREP_URL as string;
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;
export const DB_NAME = "student-companion";

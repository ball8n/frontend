import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges class names, resolving Tailwind CSS conflicts.
 *
 * Accepts any number of class name values, including conditional and dynamic values, and returns a single merged string with Tailwind CSS classes deduplicated and conflicts resolved.
 *
 * @param inputs - Class name values to combine and merge.
 * @returns A merged class name string with resolved Tailwind CSS classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

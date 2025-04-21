import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date in human-readable format
export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Get status color class
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "applied":
      return "bg-gray-500";
    case "interview":
      return "bg-amber-500";
    case "offer":
      return "bg-emerald-500";
    case "rejected":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

// Function to truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

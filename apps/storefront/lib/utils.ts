import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number, currency = "PLN"): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "long",
  }).format(d)
}

export function getCountdownToCutoff(cutoffHour: number, cutoffMinute = 0): {
  passed: boolean
  hours: number
  minutes: number
  seconds: number
  formatted: string
} {
  const now = new Date()
  const cutoff = new Date()
  cutoff.setHours(cutoffHour, cutoffMinute, 0, 0)

  const diffMs = cutoff.getTime() - now.getTime()
  if (diffMs <= 0) {
    return { passed: true, hours: 0, minutes: 0, seconds: 0, formatted: "00:00:00" }
  }

  const hours = Math.floor(diffMs / 3600000)
  const minutes = Math.floor((diffMs % 3600000) / 60000)
  const seconds = Math.floor((diffMs % 60000) / 1000)

  const pad = (n: number) => String(n).padStart(2, "0")
  return {
    passed: false,
    hours,
    minutes,
    seconds,
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  }
}

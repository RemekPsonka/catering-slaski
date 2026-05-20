"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { getCountdownToCutoff } from "@/lib/utils"

export function DeadlineCountdown({ cutoffHour = 16, cutoffMinute = 0 }: { cutoffHour?: number; cutoffMinute?: number }) {
  const [time, setTime] = useState(() => getCountdownToCutoff(cutoffHour, cutoffMinute))

  useEffect(() => {
    const t = setInterval(() => setTime(getCountdownToCutoff(cutoffHour, cutoffMinute)), 1000)
    return () => clearInterval(t)
  }, [cutoffHour, cutoffMinute])

  if (time.passed) {
    return (
      <div className="bg-coal-900 text-paper-100 text-xs md:text-sm py-2 px-4 text-center font-medium">
        <Clock className="inline-block w-4 h-4 mr-2 -mt-0.5" />
        Zamówienia złożone dziś dostarczymy <strong>pojutrze</strong>. Deadline na jutro minął.
      </div>
    )
  }

  return (
    <div className="bg-signal-500 text-snow-50 text-xs md:text-sm py-2 px-4 text-center font-medium">
      ⏰ Zamów do <strong>{String(cutoffHour).padStart(2, "0")}:{String(cutoffMinute).padStart(2, "0")} dzisiaj</strong> — dostarczymy jutro. Pozostało:{" "}
      <span className="font-mono num font-semibold">{time.formatted}</span>
    </div>
  )
}

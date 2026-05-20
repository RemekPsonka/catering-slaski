import { cn } from "@/lib/utils"

/**
 * Logo symbol — mining tower + railway tracks.
 * Color via currentColor — set with text-* class.
 */
export function LogoSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square">
        {/* Wheel top */}
        <line x1="35" y1="8" x2="45" y2="8"/>
        <line x1="35" y1="8" x2="35" y2="16"/>
        <line x1="45" y1="8" x2="45" y2="16"/>
        <line x1="33" y1="16" x2="47" y2="16"/>
        {/* Frame */}
        <line x1="25" y1="16" x2="25" y2="60"/>
        <line x1="55" y1="16" x2="55" y2="60"/>
        <line x1="40" y1="16" x2="25" y2="42"/>
        <line x1="40" y1="16" x2="55" y2="42"/>
        {/* Cross bars */}
        <line x1="25" y1="24" x2="55" y2="24"/>
        <line x1="25" y1="32" x2="55" y2="32"/>
        <line x1="25" y1="42" x2="55" y2="42"/>
        <line x1="25" y1="52" x2="55" y2="52"/>
        {/* Diagonals */}
        <line x1="25" y1="24" x2="55" y2="32"/>
        <line x1="55" y1="24" x2="25" y2="32"/>
        <line x1="25" y1="42" x2="55" y2="52"/>
        <line x1="55" y1="42" x2="25" y2="52"/>
        {/* Base building */}
        <line x1="15" y1="60" x2="65" y2="60"/>
        <line x1="15" y1="60" x2="15" y2="78"/>
        <line x1="65" y1="60" x2="65" y2="78"/>
        <line x1="15" y1="78" x2="65" y2="78"/>
        {/* Tracks */}
        <line x1="3" y1="88" x2="77" y2="88"/>
        <line x1="3" y1="94" x2="77" y2="94"/>
        <line x1="10" y1="88" x2="10" y2="94"/>
        <line x1="20" y1="88" x2="20" y2="94"/>
        <line x1="30" y1="88" x2="30" y2="94"/>
        <line x1="40" y1="88" x2="40" y2="94"/>
        <line x1="50" y1="88" x2="50" y2="94"/>
        <line x1="60" y1="88" x2="60" y2="94"/>
        <line x1="70" y1="88" x2="70" y2="94"/>
      </g>
    </svg>
  )
}

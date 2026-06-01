'use client'

import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mounted ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-colors theme-toggle-btn"
    >
      {mounted && (theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      ))}
    </button>
  )
}

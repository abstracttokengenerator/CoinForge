'use client'

import { useEffect, useState } from 'react'

export function BrowserBanner() {
  const [isFirefox, setIsFirefox] = useState(false)

  useEffect(() => {
    setIsFirefox(navigator.userAgent.toLowerCase().includes('firefox'))
  }, [])

  if (!isFirefox) return null

  return (
    <div style={{
      background: 'rgba(234,179,8,0.1)',
      border: '1px solid rgba(234,179,8,0.3)',
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.85rem',
      color: 'rgba(255,255,255,0.8)',
    }}>
      <span style={{ fontSize: '1.1rem' }}>⚠️</span>
      <span>
        Firefox may block wallet popups. For the best experience use{' '}
        <strong style={{ color: '#fbbf24' }}>Chrome, Brave, or Edge</strong>.
      </span>
    </div>
  )
}

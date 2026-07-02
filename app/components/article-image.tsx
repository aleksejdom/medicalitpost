'use client'

import React, { useState } from 'react'
import { ImageOff } from 'lucide-react'

/**
 * Artikelbild mit Fallback: Lädt das Bild nicht (404, blockierter Hotlink,
 * abgelaufene URL), erscheint statt eines kaputten Bildes ein dezenter
 * Platzhalter – oder gar nichts (fallback="hide").
 */
function ArticleImage({
  src,
  alt,
  className,
  fallback = 'placeholder',
}: {
  src?: string
  alt?: string
  className?: string
  fallback?: 'placeholder' | 'hide'
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    if (fallback === 'hide') return null
    return (
      <div
        className={`bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ${className || ''}`}
        aria-hidden='true'
      >
        <ImageOff className='w-8 h-8 text-zinc-300' />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ''}
      className={className}
      loading='lazy'
      onError={() => setFailed(true)}
    />
  )
}

export default ArticleImage

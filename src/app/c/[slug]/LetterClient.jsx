'use client'

import { useState } from 'react'
import { LetterRenderer } from '@/components/letter/LetterRenderer'
import { PasswordGate } from '@/components/letter/PasswordGate'
import { absoluteUrl } from '@/lib/utils'

export function LetterClient({ slug, initial, requiresPassword }) {
  const [letter, setLetter] = useState(initial)
  const [unlocked, setUnlocked] = useState(!requiresPassword)

  if (!unlocked) {
    return (
      <PasswordGate
        slug={slug}
        onUnlock={(l) => {
          setLetter(l)
          setUnlocked(true)
        }}
      />
    )
  }

  return <LetterRenderer letter={letter} shareUrl={absoluteUrl(`/c/${slug}`)} />
}

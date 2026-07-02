'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Mail, Send } from 'lucide-react'

function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Anmeldung fehlgeschlagen.')
      setMessage(data.message)
      setEmail('')
      setConsent(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='w-full px-6 py-8 mt-8 bg-zinc-100 dark:bg-zinc-900'>
      <p className='text-xs text-gray-500 uppercase tracking-widest mb-1 inline-flex items-center gap-1.5'>
        <Mail className='w-3.5 h-3.5' />
        Newsletter
      </p>
      <h3 className='text-xl mb-1'>Täglich die wichtigsten News aus IT & Gesundheitswesen</h3>
      <p className='text-sm text-gray-500 mb-4'>
        Jeden Tag 1–2 ausgewählte Meldungen per E-Mail – kostenlos und jederzeit abbestellbar.
      </p>

      {message ? (
        <p className='text-sm text-green-800 inline-flex items-start gap-2'>
          <CheckCircle2 className='w-4 h-4 mt-0.5 shrink-0' />
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className='flex flex-col gap-3 max-w-xl'>
          <div className='flex flex-col sm:flex-row gap-2'>
            <input
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='ihre@email.de'
              className='border border-zinc-300 bg-white px-3 py-2 flex-grow text-sm focus:outline-none focus:border-zinc-500'
            />
            <button
              type='submit'
              disabled={busy}
              className='bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 text-sm uppercase disabled:opacity-50 inline-flex items-center justify-center gap-2'
            >
              <Send className='w-4 h-4' />
              {busy ? 'Wird gesendet…' : 'Abonnieren'}
            </button>
          </div>
          <label className='flex items-start gap-2 text-xs text-gray-500'>
            <input
              type='checkbox'
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className='mt-0.5'
            />
            <span>
              Ich möchte den täglichen Newsletter von The Medical IT Post erhalten.
              Die Einwilligung kann ich jederzeit über den Abmeldelink im Newsletter
              widerrufen. Hinweise zur Verarbeitung meiner Daten finde ich in der{' '}
              <Link href='/datenschutz' className='underline'>Datenschutzerklärung</Link>.
            </span>
          </label>
          {error && <p className='text-sm text-red-600'>{error}</p>}
        </form>
      )}
    </div>
  )
}

export default NewsletterSignup

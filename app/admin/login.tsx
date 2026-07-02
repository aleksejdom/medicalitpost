'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login fehlgeschlagen.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setBusy(false)
    }
  }

  return (
    <div className='min-h-screen bg-zinc-50 flex items-center justify-center p-4'>
      <form
        onSubmit={handleSubmit}
        className='bg-white border border-gray-300 p-8 w-full max-w-sm flex flex-col gap-4'
      >
        <h1 className='text-2xl font-serif font-bold text-center inline-flex items-center justify-center gap-2'>
          <Lock className='w-5 h-5 text-gray-400' />
          Admin-Backend
        </h1>
        <p className='text-sm text-gray-500 text-center'>The Medical IT Post</p>
        <input
          type='password'
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Passwort'
          className='border border-gray-300 px-3 py-2 text-sm'
        />
        <button
          type='submit'
          disabled={busy}
          className='bg-blue-600 text-white px-5 py-2 text-sm uppercase disabled:opacity-50'
        >
          {busy ? 'Anmeldung…' : 'Anmelden'}
        </button>
        {error && <p className='text-sm text-red-600'>{error}</p>}
      </form>
    </div>
  )
}

export default AdminLogin

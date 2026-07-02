'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Eye,
  LogOut,
  Megaphone,
  Pause,
  Play,
  Plus,
  Rss,
  Save,
  Send,
  Trash2,
  Users,
} from 'lucide-react'
import type { Subscriber } from '@/lib/subscriberStore'
import type { NewsletterAd } from '@/lib/adStore'
import type { ManagedSource } from '@/lib/sourceStore'

type Tab = 'abonnenten' | 'newsletter' | 'quellen'

const STATUS_LABEL: Record<Subscriber['status'], string> = {
  pending: 'Unbestätigt',
  active: 'Aktiv',
  unsubscribed: 'Abgemeldet',
}

const MODE_LABEL: Record<ManagedSource['mode'], string> = {
  'filter-health': 'Filter: Gesundheitsbezug',
  'filter-it': 'Filter: IT-Bezug',
  none: 'Ungefiltert (Fachquelle)',
}

async function api(
  url: string,
  method: string,
  body?: unknown
): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(String(data.error || `Fehler (HTTP ${res.status})`))
  return data
}

function AdminDashboard({
  initialSubscribers,
  initialAd,
  initialSources,
}: {
  initialSubscribers: Subscriber[]
  initialAd: NewsletterAd
  initialSources: ManagedSource[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('abonnenten')
  const [subscribers, setSubscribers] = useState(initialSubscribers)
  const [ad, setAd] = useState(initialAd)
  const [sources, setSources] = useState(initialSources)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    mode: 'none' as ManagedSource['mode'],
  })

  function report(fn: () => Promise<void>) {
    setNotice(null)
    setError(null)
    setBusy(true)
    fn()
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setBusy(false))
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.refresh()
  }

  // --- Abonnenten ---

  function setStatus(email: string, status: Subscriber['status']) {
    report(async () => {
      await api('/api/admin/subscribers', 'PATCH', { email, status })
      setSubscribers((subs) =>
        subs.map((s) => (s.email === email ? { ...s, status } : s))
      )
      setNotice(`Status von ${email} geändert.`)
    })
  }

  function removeSubscriber(email: string) {
    if (!confirm(`Alle Daten von ${email} unwiderruflich löschen (DSGVO)?`)) return
    report(async () => {
      await api('/api/admin/subscribers', 'DELETE', { email })
      setSubscribers((subs) => subs.filter((s) => s.email !== email))
      setNotice(`${email} wurde vollständig gelöscht.`)
    })
  }

  // --- Newsletter / Werbung ---

  function saveAd() {
    report(async () => {
      await api('/api/admin/ad', 'POST', ad)
      setNotice('Werbe-Section gespeichert.')
    })
  }

  function sendNewsletter() {
    if (!confirm('Newsletter jetzt an alle aktiven Abonnenten senden?')) return
    report(async () => {
      const result = await api('/api/newsletter/send', 'POST')
      if (result.skipped) {
        setNotice(String(result.skipped))
      } else {
        setNotice(
          `Newsletter an ${result.recipients} Empfänger gesendet` +
            (Array.isArray(result.errors) && result.errors.length
              ? ` – ${result.errors.length} Fehler: ${result.errors.join('; ')}`
              : '.')
        )
      }
    })
  }

  // --- Quellen ---

  function addSource() {
    report(async () => {
      const created = (await api(
        '/api/admin/sources',
        'POST',
        newSource
      )) as unknown as ManagedSource
      setSources((list) => [...list, created])
      setNewSource({ name: '', url: '', mode: 'none' })
      setNotice(`Quelle "${created.name}" hinzugefügt.`)
    })
  }

  function toggleSource(source: ManagedSource) {
    report(async () => {
      await api('/api/admin/sources', 'PATCH', {
        id: source.id,
        enabled: !source.enabled,
      })
      setSources((list) =>
        list.map((s) =>
          s.id === source.id ? { ...s, enabled: !source.enabled } : s
        )
      )
    })
  }

  function deleteSource(source: ManagedSource) {
    if (!confirm(`Quelle "${source.name}" entfernen?`)) return
    report(async () => {
      await api('/api/admin/sources', 'DELETE', { id: source.id })
      setSources((list) => list.filter((s) => s.id !== source.id))
      setNotice(`Quelle "${source.name}" entfernt.`)
    })
  }

  const activeCount = subscribers.filter((s) => s.status === 'active').length

  return (
    <div className='min-h-screen bg-zinc-50 p-4 md:p-8'>
      <div className='max-w-5xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-serif font-bold'>Admin-Backend</h1>
            <p className='text-sm text-gray-500'>The Medical IT Post</p>
          </div>
          <button
            onClick={logout}
            className='text-sm text-gray-600 underline hover:text-blue-600 inline-flex items-center gap-1.5'
          >
            <LogOut className='w-4 h-4' />
            Abmelden
          </button>
        </div>

        <div className='flex gap-1 border-b border-gray-300 mb-6'>
          {(
            [
              ['abonnenten', `Abonnenten (${activeCount})`, Users],
              ['newsletter', 'Newsletter & Werbung', Megaphone],
              ['quellen', `News-Quellen (${sources.length})`, Rss],
            ] as Array<[Tab, string, React.ElementType]>
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm uppercase inline-flex items-center gap-2 ${
                tab === key
                  ? 'bg-white border border-b-0 border-gray-300 font-bold'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <Icon className='w-4 h-4' />
              {label}
            </button>
          ))}
        </div>

        {notice && (
          <p className='text-sm text-green-700 bg-green-50 border border-green-200 p-3 mb-4'>
            {notice}
          </p>
        )}
        {error && (
          <p className='text-sm text-red-700 bg-red-50 border border-red-200 p-3 mb-4'>
            {error}
          </p>
        )}

        {/* ------- Abonnenten ------- */}
        {tab === 'abonnenten' && (
          <div className='bg-white border border-gray-300 p-5 overflow-x-auto'>
            <h2 className='text-xl font-bold mb-4'>
              Abonnenten ({subscribers.length} gesamt, {activeCount} aktiv)
            </h2>
            {subscribers.length === 0 ? (
              <p className='text-sm text-gray-500'>Noch keine Anmeldungen.</p>
            ) : (
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-left border-b border-gray-300 text-gray-500'>
                    <th className='py-2 pr-4'>E-Mail</th>
                    <th className='py-2 pr-4'>Status</th>
                    <th className='py-2 pr-4'>Angemeldet</th>
                    <th className='py-2 pr-4'>Bestätigt</th>
                    <th className='py-2'>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s.email} className='border-b border-gray-100'>
                      <td className='py-2 pr-4'>{s.email}</td>
                      <td className='py-2 pr-4'>
                        <span
                          className={
                            s.status === 'active'
                              ? 'text-green-700'
                              : s.status === 'pending'
                                ? 'text-amber-600'
                                : 'text-gray-400'
                          }
                        >
                          {STATUS_LABEL[s.status]}
                        </span>
                      </td>
                      <td className='py-2 pr-4 text-gray-500'>
                        {new Date(s.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className='py-2 pr-4 text-gray-500'>
                        {s.confirmedAt
                          ? new Date(s.confirmedAt).toLocaleDateString('de-DE')
                          : '–'}
                      </td>
                      <td className='py-2 flex gap-3'>
                        {s.status === 'active' ? (
                          <button
                            disabled={busy}
                            onClick={() => setStatus(s.email, 'unsubscribed')}
                            className='text-amber-700 underline'
                          >
                            Abmelden
                          </button>
                        ) : (
                          <button
                            disabled={busy}
                            onClick={() => setStatus(s.email, 'active')}
                            className='text-green-700 underline'
                          >
                            Aktivieren
                          </button>
                        )}
                        <button
                          disabled={busy}
                          onClick={() => removeSubscriber(s.email)}
                          className='text-red-600 underline inline-flex items-center gap-1'
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className='text-xs text-gray-400 mt-4'>
              „Löschen“ entfernt alle gespeicherten Daten der Person
              unwiderruflich (Recht auf Löschung, Art. 17 DSGVO).
            </p>
          </div>
        )}

        {/* ------- Newsletter & Werbung ------- */}
        {tab === 'newsletter' && (
          <div className='flex flex-col gap-6'>
            <div className='bg-white border border-gray-300 p-5'>
              <h2 className='text-xl font-bold mb-2'>
                Werbe-Section im Newsletter
              </h2>
              <p className='text-sm text-gray-500 mb-4'>
                Diese Section wird zwischen den beiden News platziert und als
                „Anzeige“ gekennzeichnet.
              </p>

              <div className='flex flex-col gap-3 max-w-2xl'>
                <label className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={ad.enabled}
                    onChange={(e) => setAd({ ...ad, enabled: e.target.checked })}
                  />
                  Werbe-Section aktiv
                </label>
                <input
                  value={ad.title}
                  onChange={(e) => setAd({ ...ad, title: e.target.value })}
                  placeholder='Überschrift (z.B. Produktname)'
                  className='border border-gray-300 px-3 py-2 text-sm'
                />
                <textarea
                  value={ad.text}
                  onChange={(e) => setAd({ ...ad, text: e.target.value })}
                  placeholder='Werbetext'
                  rows={3}
                  className='border border-gray-300 px-3 py-2 text-sm'
                />
                <input
                  value={ad.imageUrl}
                  onChange={(e) => setAd({ ...ad, imageUrl: e.target.value })}
                  placeholder='Bild-URL (Bildmotiv, z.B. https://…/banner.jpg)'
                  className='border border-gray-300 px-3 py-2 text-sm'
                />
                <div className='flex flex-col sm:flex-row gap-3'>
                  <input
                    value={ad.linkUrl}
                    onChange={(e) => setAd({ ...ad, linkUrl: e.target.value })}
                    placeholder='Ziel-Link (https://…)'
                    className='border border-gray-300 px-3 py-2 text-sm flex-grow'
                  />
                  <input
                    value={ad.buttonText}
                    onChange={(e) => setAd({ ...ad, buttonText: e.target.value })}
                    placeholder='Button-Text'
                    className='border border-gray-300 px-3 py-2 text-sm'
                  />
                </div>
                <div className='flex gap-3'>
                  <button
                    disabled={busy}
                    onClick={saveAd}
                    className='bg-blue-600 text-white px-5 py-2 text-sm uppercase disabled:opacity-50 inline-flex items-center gap-2'
                  >
                    <Save className='w-4 h-4' />
                    Speichern
                  </button>
                  <a
                    href='/api/admin/newsletter-preview'
                    target='_blank'
                    className='border border-gray-300 px-5 py-2 text-sm uppercase hover:border-blue-500 inline-flex items-center gap-2'
                  >
                    <Eye className='w-4 h-4' />
                    Vorschau öffnen
                  </a>
                </div>
              </div>
            </div>

            <div className='bg-white border border-gray-300 p-5'>
              <h2 className='text-xl font-bold mb-2'>Versand</h2>
              <p className='text-sm text-gray-500 mb-4'>
                Versendet die 1–2 neuesten, noch nicht verschickten Beiträge an
                alle aktiven Abonnenten ({activeCount}). Für den automatischen
                täglichen Versand einen Cron-Job auf{' '}
                <code className='bg-gray-100 px-1'>POST /api/newsletter/send</code>{' '}
                einrichten.
              </p>
              <button
                disabled={busy}
                onClick={sendNewsletter}
                className='bg-zinc-900 text-white px-5 py-2 text-sm uppercase disabled:opacity-50 inline-flex items-center gap-2'
              >
                <Send className='w-4 h-4' />
                Newsletter jetzt senden
              </button>
            </div>
          </div>
        )}

        {/* ------- Quellen ------- */}
        {tab === 'quellen' && (
          <div className='flex flex-col gap-6'>
            <div className='bg-white border border-gray-300 p-5'>
              <h2 className='text-xl font-bold mb-4'>News-Quellen</h2>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-left border-b border-gray-300 text-gray-500'>
                    <th className='py-2 pr-4'>Quelle</th>
                    <th className='py-2 pr-4 hidden md:table-cell'>Feed-URL</th>
                    <th className='py-2 pr-4'>Filter</th>
                    <th className='py-2 pr-4'>Status</th>
                    <th className='py-2'>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => (
                    <tr key={source.id} className='border-b border-gray-100'>
                      <td className='py-2 pr-4 font-medium'>{source.name}</td>
                      <td className='py-2 pr-4 hidden md:table-cell text-gray-500 break-all'>
                        {source.url}
                      </td>
                      <td className='py-2 pr-4 text-gray-500'>
                        {MODE_LABEL[source.mode]}
                      </td>
                      <td className='py-2 pr-4'>
                        <span
                          className={
                            source.enabled ? 'text-green-700' : 'text-gray-400'
                          }
                        >
                          {source.enabled ? 'Aktiv' : 'Pausiert'}
                        </span>
                      </td>
                      <td className='py-2 flex gap-3'>
                        <button
                          disabled={busy}
                          onClick={() => toggleSource(source)}
                          className='text-blue-600 underline inline-flex items-center gap-1'
                        >
                          {source.enabled ? (
                            <Pause className='w-3.5 h-3.5' />
                          ) : (
                            <Play className='w-3.5 h-3.5' />
                          )}
                          {source.enabled ? 'Pausieren' : 'Aktivieren'}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => deleteSource(source)}
                          className='text-red-600 underline inline-flex items-center gap-1'
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                          Entfernen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='bg-white border border-gray-300 p-5'>
              <h2 className='text-xl font-bold mb-2'>RSS-Quelle hinzufügen</h2>
              <p className='text-sm text-gray-500 mb-4'>
                Der Feed wird vor dem Speichern getestet. Es werden nur
                deutschsprachige Beiträge publiziert.
              </p>
              <div className='flex flex-col gap-3 max-w-2xl'>
                <input
                  value={newSource.name}
                  onChange={(e) =>
                    setNewSource({ ...newSource, name: e.target.value })
                  }
                  placeholder='Name der Quelle'
                  className='border border-gray-300 px-3 py-2 text-sm'
                />
                <input
                  value={newSource.url}
                  onChange={(e) =>
                    setNewSource({ ...newSource, url: e.target.value })
                  }
                  placeholder='Feed-URL (https://…/rss.xml)'
                  className='border border-gray-300 px-3 py-2 text-sm'
                />
                <select
                  value={newSource.mode}
                  onChange={(e) =>
                    setNewSource({
                      ...newSource,
                      mode: e.target.value as ManagedSource['mode'],
                    })
                  }
                  className='border border-gray-300 px-3 py-2 text-sm bg-white'
                >
                  <option value='none'>
                    Ungefiltert – Fachquelle für Health-IT
                  </option>
                  <option value='filter-health'>
                    Allgemeine IT-Quelle – nur Artikel mit Gesundheitsbezug
                  </option>
                  <option value='filter-it'>
                    Allgemeine Gesundheits-Quelle – nur Artikel mit IT-Bezug
                  </option>
                </select>
                <button
                  disabled={busy || !newSource.name || !newSource.url}
                  onClick={addSource}
                  className='bg-blue-600 text-white px-5 py-2 text-sm uppercase disabled:opacity-50 self-start inline-flex items-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Quelle testen & hinzufügen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

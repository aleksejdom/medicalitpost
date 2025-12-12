'use client'

import React, { useEffect, useState } from 'react'

interface Cause {
  [key: string]: string
}

interface AffectedFunction {
  impactDesc: string
}

interface AppInfo {
  outage?: string
  affectedFunctions?: AffectedFunction[]
}

interface TILageData {
  cause?: Cause[]
  appStatus?: {
    [key: string]: AppInfo
  }
}

interface ServiceTab {
  id: string
  name: string
  label: string
}

function WarnungenBlock() {
  const [data, setData] = useState<TILageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTestData, setShowTestData] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Service-Tabs wie auf der gematik-Website
  const serviceTabs: ServiceTab[] = [
    { id: 'all', name: 'all', label: 'Alle Services' },
    { id: 'erezept', name: 'E-Rezept', label: 'E-Rezept' },
    { id: 'epa', name: 'ePA', label: 'ePA' },
    { id: 'kim', name: 'KIM', label: 'KIM' },
    { id: 'ogd', name: 'ÖGD', label: 'ÖGD' },
    { id: 'tianschluss', name: 'TI-Anschluss', label: 'TI-Anschluss' },
    { id: 'vsdm', name: 'VSDM', label: 'VSDM' },
    { id: 'wanda', name: 'WANDA', label: 'WANDA' },
  ]

  const title = "TI-Lagebild"; 

  useEffect(() => {
    const fetchTILage = async () => {
      try { 
        const baseUrl = 'https://ti-lage.prod.ccs.gematik.solutions/lageapi/v2/tilage'
        const params = new URLSearchParams(window.location.search)
        const allowedParams = ['ciAccess', 'ciTspSmcb', 'ciTspHba', 'ciKim']
        let queryParts: string[] = []

        allowedParams.forEach(param => {
          const value = params.get(param)
          if (value) {
            queryParts.push(`${param}=${encodeURIComponent(value)}`)
          }
        })

        const apiUrl = queryParts.length ? `${baseUrl}?${queryParts.join('&')}` : baseUrl
        const response = await fetch(apiUrl)
        const result = await response.json()
        setData(result)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
        setLoading(false)
      }
    }

    fetchTILage()
  }, [showTestData])

  if (loading) {
    return (
      <div className='w-full md:max-w-6xl max-w-full md:mt-15 mt-5 md:mb-7'>
        <div className='bg-white border-2 border-red-500 p-5'>
          <p className='font-bold text-lg mb-4'>{title}</p>
          <p className='text-gray-500'>Wird geladen...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full md:max-w-6xl max-w-full md:mt-15 mt-5 md:mb-7'>
        <div className='bg-white border-2 border-red-500 p-5'>
          <p className='font-bold text-lg mb-4'>{title}</p>
          <p className='text-red-600'>Fehler: {error}</p>
        </div>
      </div>
    )
  }

  // Filter und Anzeige von Services basierend auf aktuellem Tab
  const filteredAppStatus = activeTab === 'all' 
    ? data?.appStatus 
    : Object.fromEntries(
        Object.entries(data?.appStatus || {}).filter(([name]) => 
          name.toLowerCase().includes(activeTab.toLowerCase()) || 
          serviceTabs.find(t => t.id === activeTab && t.name.toLowerCase() === name.toLowerCase())
        )
      )

  return (
    <div className='w-full md:max-w-6xl max-w-full md:mt-15 mt-5 md:mb-7'>
      <div className='bg-white border-2 border-red-500 p-5 mb-4'>
        <div className='flex justify-between items-center mb-4'>
          <p className='font-bold text-lg'>{title}</p> 
        </div>

        {/* Service-Tabs */}
        <div className='border-b border-gray-200'>
          <div className='flex gap-2 overflow-x-auto'>
            {serviceTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className='p-4'>
          {/* Aktuelle Störungen */}
          <h3 className='font-bold text-lg mb-3'>Aktuelle Störungen</h3>
          {data?.cause && data.cause.length > 0 ? (
            <ul className='list-disc list-inside mb-5'>
              {data.cause.map((cause, index) => (
                <li key={index} className='text-sm'>
                  {typeof cause === 'object' ? Object.values(cause).join(' | ') : cause}
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-sm mb-5'>Keine Störungen bekannt.</p>
          )}

          {/* Service Status */}
          <h3 className='font-bold text-lg mb-3'>Service Status</h3>
          {filteredAppStatus && Object.entries(filteredAppStatus).length > 0 ? (
            <div className='space-y-3'>
              {Object.entries(filteredAppStatus).map(([appName, appInfo]) => {
                const statusColor = 
                  appInfo.outage === 'none' ? 'text-green-600' :
                  appInfo.outage === 'partial' ? 'text-orange-600' :
                  'text-red-600'
                
                const statusBg =
                  appInfo.outage === 'none' ? 'bg-green-50 border-green-200' :
                  appInfo.outage === 'partial' ? 'bg-orange-50 border-orange-200' :
                  'bg-red-50 border-red-200'

                return (
                  <div key={appName} className={`border rounded p-3 ${statusBg}`}>
                    <div className='flex items-center gap-3 mb-2'>
                      <div className={`w-4 h-4 rounded-full ${
                        appInfo.outage === 'none' ? 'bg-green-500' :
                        appInfo.outage === 'partial' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}></div>
                      <strong className={statusColor}>{appName}</strong>
                      <span className={`text-sm ${statusColor}`}>
                        {appInfo.outage === 'none' ? '✓ Operational' :
                         appInfo.outage === 'partial' ? '⚠ Teilweise beeinträchtigt' :
                         '✕ Ausfallend'}
                      </span>
                    </div>
                    {appInfo.affectedFunctions && appInfo.affectedFunctions.length > 0 && (
                      <div className='ml-7 mt-2'>
                        <p className='text-xs font-semibold mb-1'>Betroffene Funktionen:</p>
                        <ul className='list-disc list-inside text-sm'>
                          {appInfo.affectedFunctions.map((func, index) => (
                            <li key={index}>{func.impactDesc || '-'}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className='text-sm'>Keine Informationen für diesen Service verfügbar.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default WarnungenBlock
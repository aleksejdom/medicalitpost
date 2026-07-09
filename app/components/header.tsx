'use client'

import Link from 'next/link'
import React from 'react'
import { Menu, X } from 'lucide-react'
import { useMenu } from '@/app/context/MenuContext'

export default function HeaderBlock() {
  const { isOpen, toggleMenu } = useMenu()

  return (
    <div className='relative md:p-5 p-2 bg-white flex flex-col items-center justify-center w-full md:mb-5'>
      {/* Burger-Toggle – Mobile: fixed oben rechts, immer erreichbar
          (z-50 liegt über Menü z-40 und Overlay z-30) */}
      <button
        onClick={toggleMenu}
        className={`fixed top-4 right-4 md:hidden z-50 p-2 rounded-full border shadow-md focus:outline-none transition-colors duration-300 ${
          isOpen
            ? 'bg-zinc-900/90 border-zinc-700 text-white'
            : 'bg-white/95 border-gray-300 text-gray-700 hover:text-blue-500'
        }`}
        aria-label={isOpen ? 'Menü schließen' : 'Menü öffnen'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
      </button>

      <Link href="/" className='flex flex-col md:items-center justify-center gap-3'>
        <h1 className='md:text-7xl text-2xl text-left md:text-center'>THE MEDICAL IT POST</h1>
        <p className='md:text-xl text-sm uppercase md:text-center text-left text-zinc-400 tracking-widest'>News aus IT &amp; Gesundheitswesen – täglich kompakt und relevant</p>
      </Link>
    </div>
  )
}

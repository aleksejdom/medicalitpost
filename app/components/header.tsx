'use client'

import Link from 'next/link'
import React from 'react'
import { useMenu } from '@/app/context/MenuContext'

export default function HeaderBlock() {
  const { isOpen, toggleMenu } = useMenu()

  return (
    <div className='relative md:p-5 p-2 bg-white flex flex-col items-center justify-center w-full md:mb-5'>
      {/* Burger Icon - Mobile Only */}
      <button
        onClick={toggleMenu}
        className={`absolute top-5 right-5 md:hidden z-50 focus:outline-none transition-colors duration-300 ${
          isOpen ? 'text-white' : 'text-gray-700 hover:text-blue-500'
        }`}
        aria-label='Toggle menu'
      >
        {isOpen ? (
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        ) : (
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        )}
      </button>

      <Link href="/" className='flex flex-col md:items-center justify-center gap-3'>
        <h1 className='md:text-7xl text-2xl text-left md:text-center'>THE MEDICAL IT POST</h1>
        <p className='md:text-xl text-sm uppercase md:text-center text-left text-zinc-400 tracking-widest'>Aktuelle IT Fakten für die Medizin – täglich kompakt und relevant</p>
      </Link>
    </div>
  )
}

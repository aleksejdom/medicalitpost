'use client'

import Link from 'next/link'
import React from 'react'
import { Menu, X } from 'lucide-react'
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
        {isOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
      </button>

      <Link href="/" className='flex flex-col md:items-center justify-center gap-3'>
        <h1 className='md:text-7xl text-2xl text-left md:text-center'>THE MEDICAL IT POST</h1>
        <p className='md:text-xl text-sm uppercase md:text-center text-left text-zinc-400 tracking-widest'>News aus IT &amp; Gesundheitswesen – täglich kompakt und relevant</p>
      </Link>
    </div>
  )
}

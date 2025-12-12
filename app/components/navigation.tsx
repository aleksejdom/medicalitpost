'use client'

import React from 'react'
import { useMenu } from '@/app/context/MenuContext'

function NavigationBlock() {
  const { isOpen, closeMenu } = useMenu()

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'IT-Sicherheit', href: '/kategorie/it-sicherheit' },
    { name: 'Telematik', href: '/kategorie/telematik' },
    { name: 'Software', href: '/kategorie/software' },
    { name: 'Digitalisierung', href: '/kategorie/digitalisierung' }, 
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className='sticky top-0 z-30 nav-bar bg-gray-50 hidden md:block border-t border-b border-gray-400 w-full py-2'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-wrap items-center justify-center gap-6 md:gap-8'>
            {navItems.map((item) => (
              <a
                key={item.name} 
                href={item.href}
                className='text-gray-700 hover:text-blue-500 text-l font-medium uppercase'
              >   
                {item.name}
              </a>
            ))} 
          </div>
        </div>
      </div>

      {/* Slide-out Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-screen w-80 bg-gray-50 border-r border-gray-400 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex flex-col pt-20 px-4 gap-4'>
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className='text-gray-700 hover:text-blue-500 text-lg font-medium uppercase block py-3 border-b border-gray-200'
              onClick={closeMenu}
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden'
          onClick={closeMenu}
        />
      )}
    </>
  )
}

export default NavigationBlock
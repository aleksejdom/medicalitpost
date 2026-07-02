import Link from 'next/link'
import React from 'react'

function FooterBlock() {

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'IT-Sicherheit', href: '/kategorie/it-sicherheit' },
    { name: 'Telematik', href: '/kategorie/telematik' },
    { name: 'Software', href: '/kategorie/software' },
    { name: 'Digitalisierung', href: '/kategorie/digitalisierung' }, 
  ];

  return (
    <>    
      <div className='grid md:grid-cols-2 gap-4 w-full max-w-6xl mx-auto p-5 pt-10 pb-10 border-t border-gray-300 gap-10 mt-5 mb-2 border-b border-gray-300'>
        <div className='flex flex-col gap-2'>
          <h3 className='uppercase text-2xl'>THE MEDICAL IT POST</h3>
          <p className='max-w-md text-gray-500 text-sm'>
            The Medical IT Post ist die führende Nachrichtenquelle für IT-Entscheider in Arztpraxen, MVZ und Kliniken in Deutschland.
          </p>
        </div>
        {/* <div>
          <p className='uppercase text-sm font-bold'>Kategorien</p>
          <div className='flex flex-col gap-2 mt-4'>
            {navItems.map((item) => (
              <Link
              key={item.name    }
              href={item.href}
              className='text-gray-700 hover:text-blue-500 text-sm uppercase'   
              >   
                {item.name}
              </Link>
            ))}
          </div>
        </div> */}
      </div> 
      <p className='text-sm text-gray-400 mt-5 mb-1'>
        Alle Artikel basieren auf öffentlich zugänglichen Informationen und wurden automatisch in eigenen Worten zusammengefasst.
      </p>
      <p className='text-sm text-gray-600 mt-1 mb-5 uppercase'>
        © 2025 The Medical IT Post. Alle Rechte vorbehalten. | Powered by IT-ÄRZTE GmbH
        {' | '}
        <Link href='/datenschutz' className='hover:text-blue-500'>Datenschutz</Link>
      </p>
    </>
  )
}

export default FooterBlock
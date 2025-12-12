import React from 'react'

function ArticlePage() {
  const articles = [
    {
      id: 1,
      categorie: 'IT-Sicherheit',
      overline: 'Tech Alert',
      title: 'Neuer IT-Sicherheitsstandard für medizinische Geräte veröffentlicht',
      text: 'Der neue IT-Sicherheitsstandard für medizinische Geräte wurde veröffentlicht, um den Schutz sensibler Patientendaten zu gewährleisten und Cyberangriffe zu verhindern.',
      date: '2024-06-15',
    },
    {
      id: 2,
      categorie: 'IT-Sicherheit',
      overline: 'Tech Alert',
      title: 'Sophos Firewall',
      text: 'Sophos hat eine neue Version seiner Firewall-Software veröffentlicht, die erweiterte Sicherheitsfunktionen und verbesserte Leistung bietet.',
      date: '2024-06-25',
    },
    {
      id: 3,
      categorie: 'IT-Sicherheit',
      overline: 'Tech Alert',
      title: 'CGM veröffentlicht neue Sicherheitsrichtlinien für Gesundheits-IT',
      text: 'CGM hat neue Sicherheitsrichtlinien für seine Gesundheits-IT-Produkte veröffentlicht, um den Schutz vor Cyberbedrohungen zu verbessern und die Einhaltung gesetzlicher Vorschriften zu gewährleisten.',
      date: '2024-06-25',
    },
     {
      id: 4,
      categorie: 'IT-Sicherheit',
      overline: 'Tech Alert',
      title: 'Tomedo 22.1 mit neuen Sicherheitsfunktionen',
      text: 'Die neueste Version der Tomedo-Software, Version 22.1, wurde veröffentlicht und bietet verbesserte Sicherheitsfunktionen zum Schutz sensibler Patientendaten.',
      date: '2024-06-25',
    }
  ]
  return (
    <div>
      <p className='text-xs text-gray-500 uppercase'>{articles[0].overline}</p>
      <h3 className='text-3xl mb-6'>{articles[0].categorie}</h3>

      <div className='grid md:grid-cols-3 gap-5'>  
        {articles.map((article) => (
          <div key={article.id} className='border border-gray-300 p-5'>  
            <h2 className='text-2xl font-serif font-bold mt-2 mb-2'>{article.title}</h2>
            <p className='text-gray-700 mb-3'>{article.text}</p>
            <p className='text-sm text-gray-500'>{new Date(article.date).toLocaleDateString('de-DE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
          </div>
        ))}
      </div>
      
    </div>
  )
}

export default ArticlePage
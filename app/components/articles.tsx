import React from 'react'
import ArticlePage from './article'

function ArticlesBlock() {
  return (
    <div className='p-5 w-full max-w-6xl mt-5 flex flex-col gap-18'>
      <ArticlePage />
      <ArticlePage />
      <ArticlePage />
    </div>
  )
}

export default ArticlesBlock
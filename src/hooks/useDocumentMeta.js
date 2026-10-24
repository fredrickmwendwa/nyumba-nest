import { useEffect } from 'react'

const SITE = 'Nyumba Nest'

// Sets the page title and meta description for the current route.
export function useDocumentMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : `${SITE}: homes to rent and buy in Nairobi`
    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }
  }, [title, description])
}

import { useEffect } from 'react'

export function useGoogleFont(font: string) {
  useEffect(() => {
    if (!font) {
      return
    }

    const id = `google-font-${font
      .toLowerCase()
      .replace(/\s+/g, '-')}`

    if (document.getElementById(id)) {
      return
    }

    const link = document.createElement('link')

    link.id = id
    link.rel = 'stylesheet'

    link.href =
      `https://fonts.googleapis.com/css2?family=` +
      `${encodeURIComponent(font).replace(/%20/g, '+')}` +
      `:wght@400;500;600;700&display=swap`

    document.head.appendChild(link)
  }, [font])
}
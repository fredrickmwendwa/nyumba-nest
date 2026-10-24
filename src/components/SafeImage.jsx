import { useState } from 'react'
import { url } from '../config.js'
import { Mark } from './Logo.jsx'

// Standard <img> with a graceful fallback. The wrapper owns the aspect ratio, so real photos can replace placeholders without layout changes.
export default function SafeImage({ image, ratio = '4 / 3', eager = false, className = '' }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`media ${className}`} style={{ aspectRatio: ratio }}>
      {failed ? (
        <div className="media__fallback" role="img" aria-label={image.alt}>
          <Mark size={32} />
          <span>Photo could not be loaded</span>
        </div>
      ) : (
        <img
          key={image.src}
          src={url(image.src)}
          alt={image.alt}
          width="1200"
          height="900"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

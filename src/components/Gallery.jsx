import { useRef, useState } from 'react'
import Dialog from './Dialog.jsx'
import Icon from './Icon.jsx'
import SafeImage from './SafeImage.jsx'
import { Button } from './ui.jsx'

function Lightbox({ images, index, setIndex, onClose, open }) {
  const n = images.length
  const go = (d) => setIndex((i) => (i + d + n) % n)
  return (
    <Dialog
      open={open}
      onClose={onClose}
      label="Photo viewer"
      className="dialog--lightbox"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1)
        if (e.key === 'ArrowLeft') go(-1)
      }}
    >
      <div className="lightbox">
        <div className="lightbox__top">
          <span className="lightbox__count" aria-live="polite">{index + 1} / {n}</span>
          <Button variant="on-dark" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="lightbox__stage">
          <SafeImage image={images[index]} ratio="4 / 3" eager className="lightbox__img" />
        </div>
        <p className="lightbox__caption">{images[index].alt}</p>
        <div className="lightbox__nav">
          <Button variant="on-dark" onClick={() => go(-1)} aria-label="Previous photo"><Icon name="chevron-left" /> Previous</Button>
          <Button variant="on-dark" onClick={() => go(1)} aria-label="Next photo">Next <Icon name="chevron-right" /></Button>
        </div>
        <ul className="lightbox__thumbs">
          {images.map((img, i) => (
            <li key={img.src + i}>
              <button type="button" className={`thumb${i === index ? ' is-on' : ''}`} aria-current={i === index ? 'true' : undefined} aria-label={`Show photo ${i + 1}`} onClick={() => setIndex(i)}>
                <SafeImage image={img} ratio="4 / 3" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  )
}

// Desktop and tablet: photo mosaic. Phones: swipeable rail with a counter. Both open the viewer.
export default function Gallery({ images }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [rail, setRail] = useState(0)
  const railRef = useRef(null)
  const n = images.length
  const five = n >= 5
  const tiles = images.slice(0, five ? 5 : 3)
  const openAt = (i) => { setIndex(i); setOpen(true) }

  return (
    <div className="gallery">
      <div className={`gallery__mosaic gallery__mosaic--${five ? 'five' : 'three'}`}>
        {tiles.map((img, i) => {
          const last = i === tiles.length - 1 && n > 1
          return (
            <button key={img.src + i} type="button" className="gallery__tile" onClick={() => openAt(i)} aria-label={last ? `View all ${n} photos` : `Open photo ${i + 1} of ${n}: ${img.alt}`}>
              <SafeImage image={img} ratio="auto" eager={i === 0} className="media--fill" />
              {last && <span className="gallery__more">View all {n} photos</span>}
            </button>
          )
        })}
      </div>

      <div className="gallery__railwrap">
        <ul className="gallery__rail" ref={railRef} onScroll={() => { const el = railRef.current; setRail(Math.round(el.scrollLeft / el.clientWidth)) }} aria-label="Photos, swipe sideways">
          {images.map((img, i) => (
            <li key={img.src + i}>
              <button type="button" onClick={() => openAt(i)} aria-label={`Open photo ${i + 1} of ${n}: ${img.alt}`}>
                <SafeImage image={img} ratio="3 / 2" eager={i === 0} />
              </button>
            </li>
          ))}
        </ul>
        <span className="gallery__counter">{Math.min(rail + 1, n)} / {n}</span>
      </div>

      <Lightbox open={open} onClose={() => setOpen(false)} images={images} index={index} setIndex={setIndex} />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useProperties } from '../context/PropertiesContext.jsx'
import { useSaved } from '../context/SavedContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import PropertyCard from '../components/PropertyCard.jsx'
import Dialog from '../components/Dialog.jsx'
import { Mark } from '../components/Logo.jsx'
import { Alert, Button, EmptyState, ErrorState, SkeletonCard } from '../components/ui.jsx'

export default function Saved() {
  const { status, properties, retry } = useProperties()
  const { slugs, persistent, remove, add, clear, prune, removedCount, dismissRemoved } = useSaved()
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)
  useDocumentMeta('Saved homes', 'Your shortlist of saved homes, kept on this device.')

  useEffect(() => { if (status === 'ready') prune(properties.map((p) => p.slug)) }, [status, properties, prune])

  const saved = [...slugs].reverse().map((s) => properties.find((p) => p.slug === s)).filter(Boolean)

  const removeOne = (p) => {
    remove(p.slug)
    toast.show({ message: 'Removed from your shortlist.', action: { label: 'Undo', onClick: () => add(p.slug) } })
  }

  return (
    <div className="container saved">
      <div className="saved__head">
        <div>
          <h1 className="text-page">Saved homes</h1>
          <p className="muted" role="status">{status === 'ready' ? `${saved.length} ${saved.length === 1 ? 'home' : 'homes'} saved on this device` : 'Loading saved homes'}</p>
        </div>
        {saved.length > 0 && <Button variant="text" onClick={() => setConfirm(true)}>Clear all</Button>}
      </div>

      {removedCount > 0 && (
        <Alert tone="info">
          <p>{removedCount} saved {removedCount === 1 ? 'home is' : 'homes are'} no longer listed, so we removed {removedCount === 1 ? 'it' : 'them'} from your shortlist. <button type="button" className="link-button" onClick={dismissRemoved}>Dismiss</button></p>
        </Alert>
      )}
      {!persistent && <Alert tone="warning"><p>Your browser is blocking storage, so saved homes will be lost when you leave this page.</p></Alert>}

      <h2 className="visually-hidden">Your saved homes</h2>
      {status === 'error' && <ErrorState onRetry={retry} />}
      {status === 'loading' && <ul className="grid" aria-busy="true">{slugs.slice(0, 3).map((s) => <li key={s}><SkeletonCard /></li>)}</ul>}

      {status === 'ready' && saved.length === 0 && (
        <EmptyState
          mark={<Mark size={56} className="empty__mark" />}
          title="No saved homes yet"
          actions={<><Button to="/properties?type=rent">Browse homes to rent</Button><Button to="/properties?type=buy" variant="outline">Browse homes for sale</Button></>}
        >
          Tap Save property on any listing and it will appear here, ready for when you want to compare or ask for a viewing.
        </EmptyState>
      )}

      {saved.length > 0 && (
        <>
          <ul className="grid">{saved.map((p) => <li key={p.id}><PropertyCard property={p} variant="saved" onRemove={() => removeOne(p)} /></li>)}</ul>
          <p className="small muted">Saved homes are kept in this browser only. Clearing site data removes them.</p>
        </>
      )}

      <Dialog open={confirm} onClose={() => setConfirm(false)} label="Clear all saved homes" className="dialog--confirm">
        <div className="confirm">
          <h2 className="text-card">Clear all saved homes?</h2>
          <p className="muted">This removes {saved.length} {saved.length === 1 ? 'home' : 'homes'} from your shortlist on this device.</p>
          <div className="row-actions">
            <Button variant="secondary" autoFocus onClick={() => setConfirm(false)}>Keep them</Button>
            <Button variant="outline" onClick={() => { clear(); setConfirm(false) }}>Clear all</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

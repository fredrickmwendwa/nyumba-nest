import { useSaved } from '../context/SavedContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Icon from './Icon.jsx'

export default function FavouriteButton({ property, variant = 'icon', className = '' }) {
  const { isSaved, toggle, add, persistent } = useSaved()
  const toast = useToast()
  const saved = isSaved(property.slug)

  const onClick = () => {
    toggle(property.slug)
    if (saved) {
      toast.show({ message: 'Removed from your shortlist.', action: { label: 'Undo', onClick: () => add(property.slug) } })
    } else {
      toast.show({
        message: persistent ? 'Saved to your shortlist.' : 'Saved for this visit only. Your browser is blocking storage.',
        action: { label: 'View saved', to: '/saved' },
      })
    }
  }

  return (
    <button
      type="button"
      className={`fav fav--${variant} ${className}`}
      aria-pressed={saved}
      aria-label={variant === 'icon' ? `Save ${property.title}` : `Save property: ${property.title}`}
      onClick={onClick}
    >
      <Icon name="heart" size={22} fill={saved ? 'currentColor' : 'none'} />
      {variant === 'text' && <span aria-hidden="true">{saved ? 'Saved' : 'Save property'}</span>}
    </button>
  )
}

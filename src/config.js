// Agency details are placeholders. Replace them before deployment.
export const agency = {
  name: 'Nyumba Nest',
  whatsappNumber: '254700000000',
  displayPhone: '+254 700 000 000',
  email: 'hello@nyumbanest.example',
}

export const PAGE_SIZE = 12
export const STORAGE_KEY = 'nyumbanest:saved:v1'

export const RENT_STEPS = [20000, 30000, 40000, 50000, 60000, 80000, 100000, 150000, 200000, 300000]
export const BUY_STEPS = [3000000, 5000000, 8000000, 10000000, 15000000, 20000000, 30000000, 50000000, 100000000]

export const VIEWING_WINDOWS = [
  { id: 'morning', label: 'Morning', hours: '9 am to 12 pm' },
  { id: 'afternoon', label: 'Afternoon', hours: '12 pm to 4 pm' },
  { id: 'evening', label: 'Evening', hours: '4 pm to 6 pm' },
]

export const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Apartment' },
  { id: 'studio', label: 'Studio' },
  { id: 'maisonette', label: 'Maisonette' },
  { id: 'townhouse', label: 'Townhouse' },
  { id: 'house', label: 'House' },
]

export const AMENITIES = {
  parking: 'Parking',
  lift: 'Lift',
  'backup-generator': 'Backup generator',
  security: 'Gated compound with a guard',
  balcony: 'Balcony',
  internet: 'Fibre internet ready',
  gym: 'Gym',
  pool: 'Swimming pool',
  garden: 'Garden',
  'play-area': "Children's play area",
  borehole: 'Borehole water supply',
}

export const SORTS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Price, low to high' },
  { id: 'price-desc', label: 'Price, high to low' },
  { id: 'newest', label: 'Newest' },
]

export const url = (path) => `${import.meta.env?.BASE_URL ?? '/'}${path.replace(/^\//, '')}`

// Points every listing image at your real photos.
// Put photos in public/images/listings/ named <kind>-<number>.jpg (or .jpeg, .webp, .png).
// Kinds: living, kitchen, bedroom, bathroom, exterior, balcony, garden, view, pool.
// Optional house or apartment tag for outdoor kinds: exterior-apt-1.jpg, exterior-house-2.jpg.
// Apartments and studios use "apt" or untagged photos; houses, maisonettes and townhouses use "house" or untagged ones.
// Then run: npm run images
// Kinds with no photos keep their placeholder. Safe to run again.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const DIR = 'public/images/listings'
const DATA = 'public/data/properties.json'
const KINDS = ['living', 'kitchen', 'bedroom', 'bathroom', 'exterior', 'balcony', 'garden', 'view', 'pool']
const FLATS = new Set(['apartment', 'studio'])

const photos = readdirSync(DIR)
  .map((file) => {
    const m = file.match(/^([a-z]+)(?:-(apt|house))?-(\d+)\.(jpe?g|webp|png)$/i)
    return m ? { file, kind: m[1], tag: m[2] || null } : null
  })
  .filter(Boolean)
  .sort((a, b) => a.file.localeCompare(b.file))

const properties = JSON.parse(readFileSync(DATA, 'utf8'))
const suffix = ' (placeholder image)'
let changed = 0
const used = {} // round-robin counters per kind and group, so every photo gets used evenly

properties.forEach((p, pi) => {
  const group = FLATS.has(p.propertyType) ? 'apt' : 'house'
  p.images.forEach((img, ii) => {
    const kind = KINDS.find((k) => new RegExp(`(^|/)${k}[-.]`).test(img.src))
    if (!kind) return
    const ofKind = photos.filter((x) => x.kind === kind)
    const fitting = ofKind.filter((x) => x.tag === null || x.tag === group)
    const pool = fitting.length ? fitting : ofKind
    if (pool.length === 0) {
      img.src = `images/placeholders/${kind}.svg`
      if (!img.alt.endsWith(suffix)) img.alt += suffix
      return
    }
    if (img.alt.endsWith(suffix)) img.alt = img.alt.slice(0, -suffix.length)
    // Cycle through the photos so neighbouring listings differ and repeated rooms in one listing differ too.
    const key = `${kind}:${group}`
    used[key] = used[key] ?? pi
    img.src = `images/listings/${pool[used[key]++ % pool.length].file}`
    changed += 1
  })
})

writeFileSync(DATA, JSON.stringify(properties, null, 2) + '\n')
console.log(`Found ${photos.length} photos. Updated ${changed} image references.`)
for (const k of KINDS) if (!photos.some((x) => x.kind === k)) console.log(`  no photos yet for "${k}" (placeholder kept)`)

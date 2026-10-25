// Points every listing image at your real photos.
// Put photos in public/images/listings/ named <kind>-<number>.jpg (or .jpeg, .webp, .png).
// Kinds: living, kitchen, bedroom, bathroom, exterior, balcony, garden, view, pool.
// Then run: npm run images
// Listings with no photo for a kind keep their placeholder. Safe to run again.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const DIR = 'public/images/listings'
const DATA = 'public/data/properties.json'
const KINDS = ['living', 'kitchen', 'bedroom', 'bathroom', 'exterior', 'balcony', 'garden', 'view', 'pool']

const files = readdirSync(DIR).filter((f) => /^[a-z]+-\d+\.(jpe?g|webp|png)$/i.test(f))
const byKind = Object.fromEntries(KINDS.map((k) => [k, files.filter((f) => f.startsWith(`${k}-`)).sort()]))

const properties = JSON.parse(readFileSync(DATA, 'utf8'))
let changed = 0
properties.forEach((p, pi) => {
  p.images.forEach((img, ii) => {
    const kind = KINDS.find((k) => new RegExp(`(^|/)${k}[-.]`).test(img.src))
    if (!kind) return
    const pool = byKind[kind]
    if (pool.length === 0) {
      img.src = `images/placeholders/${kind}.svg`
      return
    }
    // Spread photos so neighbouring listings do not look identical.
    img.src = `images/listings/${pool[(pi * 3 + ii) % pool.length]}`
    changed += 1
  })
})
writeFileSync(DATA, JSON.stringify(properties, null, 2) + '\n')
console.log(`Found ${files.length} photos. Updated ${changed} image references.`)
for (const k of KINDS) if (byKind[k].length === 0) console.log(`  no photos yet for "${k}" (placeholder kept)`)
